/* POST /api/render — authenticated: deduct credits server-side, then create
   the upstream job. Cost is computed HERE (client numbers are display only).
   Returns: { jobId, engine, cost, balance }
     401 → not signed in (frontend opens the auth modal)
     402 → insufficient credits
     501 → engine keys or auth backend not configured (frontend demo mode) */
import {
  ARK_BASE, SEEDANCE_MODEL, KLING_BASE,
  hasSeedance, hasKling, klingToken, upstreamJson
} from "./_lib.js";
import { getUser, hasAuthBackend, spendCredits, addCredits, insertRow } from "./_auth.js";

const ENGINE_COST = { seedance: 9, kling21: 12 };
const RES_MULT = { 720: 0.8, 1080: 1, "4k": 1.6 };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const {
    prompt,
    model = "auto",
    ratio = "16:9",
    duration = 5,
    resolution = "1080"
  } = req.body || {};
  if (!prompt || !String(prompt).trim()) {
    return res.status(400).json({ error: "prompt required" });
  }

  let engine = model;
  if (model === "auto") engine = hasSeedance() ? "seedance" : "kling21";
  const engineReady = engine === "seedance" ? hasSeedance() : hasKling();
  if (!engineReady || !ENGINE_COST[engine]) {
    return res.status(501).json({ error: `engine ${engine} not configured`, demo: true });
  }
  if (!hasAuthBackend()) {
    return res.status(501).json({ error: "auth backend not configured", demo: true });
  }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "sign in required" });

  const dur = Math.min(Number(duration) || 5, 10);
  const cost = Math.max(1, Math.round(ENGINE_COST[engine] * (dur / 5) * (RES_MULT[resolution] ?? 1)));

  const balance = await spendCredits(user.id, cost);
  if (balance < 0) return res.status(402).json({ error: "insufficient credits" });

  try {
    let jobId;
    if (engine === "seedance") {
      const resLabel = resolution === "4k" ? "1080p" : `${resolution}p`;
      const text = `${prompt} --ratio ${ratio} --resolution ${resLabel} --duration ${dur}`;
      const data = await upstreamJson(`${ARK_BASE}/contents/generations/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ARK_API_KEY}`
        },
        body: JSON.stringify({
          model: SEEDANCE_MODEL,
          content: [{ type: "text", text }]
        })
      });
      jobId = data.id;
    } else {
      const data = await upstreamJson(`${KLING_BASE}/v1/videos/text2video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${klingToken()}`
        },
        body: JSON.stringify({
          model_name: process.env.KLING_MODEL || "kling-v2-1-master",
          prompt,
          duration: dur >= 10 ? "10" : "5",
          aspect_ratio: ratio,
          mode: "std"
        })
      });
      jobId = data.data.task_id;
    }

    await insertRow("render_jobs", {
      id: String(jobId),
      user_id: user.id,
      engine,
      prompt: String(prompt).slice(0, 500),
      cost
    });
    return res.status(200).json({ jobId, engine, cost, balance });
  } catch (e) {
    // upstream rejected the job — give the credits back
    await addCredits(user.id, cost).catch(() => {});
    return res.status(502).json({ error: String(e.message || e) });
  }
}
