/* POST /api/render — create a video generation job upstream.
   Body: { prompt, model: "auto"|"seedance"|"kling21", ratio, duration, resolution }
   Returns: { jobId, engine }  ·  501 when no upstream keys are configured (frontend falls back to demo mode). */
import {
  ARK_BASE, SEEDANCE_MODEL, KLING_BASE,
  hasSeedance, hasKling, klingToken, upstreamJson
} from "./_lib.js";

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

  try {
    if (engine === "seedance") {
      if (!hasSeedance()) {
        return res.status(501).json({ error: "ARK_API_KEY not configured", demo: true });
      }
      // Volcano Ark passes generation params as trailing text flags.
      const resLabel = resolution === "4k" ? "1080p" : `${resolution}p`;
      const dur = Math.min(Number(duration) || 5, 10);
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
      return res.status(200).json({ jobId: data.id, engine: "seedance" });
    }

    if (engine === "kling21") {
      if (!hasKling()) {
        return res.status(501).json({ error: "KLING keys not configured", demo: true });
      }
      // Kling supports 5s / 10s only.
      const dur = Number(duration) >= 10 ? "10" : "5";
      const data = await upstreamJson(`${KLING_BASE}/v1/videos/text2video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${klingToken()}`
        },
        body: JSON.stringify({
          model_name: process.env.KLING_MODEL || "kling-v2-1-master",
          prompt,
          duration: dur,
          aspect_ratio: ratio,
          mode: "std"
        })
      });
      return res.status(200).json({ jobId: data.data.task_id, engine: "kling21" });
    }

    return res.status(400).json({ error: `engine "${engine}" is not enabled yet` });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
