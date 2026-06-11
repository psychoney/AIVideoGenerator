/* GET /api/job?id=…&engine=seedance|kling21 — poll an upstream job.
   Returns: { status: "queued"|"running"|"succeeded"|"failed", videoUrl?, error? } */
import {
  ARK_BASE, KLING_BASE,
  hasSeedance, hasKling, klingToken, upstreamJson
} from "./_lib.js";

export default async function handler(req, res) {
  const { id, engine } = req.query || {};
  if (!id || !engine) {
    return res.status(400).json({ error: "id and engine required" });
  }

  try {
    if (engine === "seedance") {
      if (!hasSeedance()) return res.status(501).json({ error: "not configured" });
      const data = await upstreamJson(`${ARK_BASE}/contents/generations/tasks/${id}`, {
        headers: { Authorization: `Bearer ${process.env.ARK_API_KEY}` }
      });
      const map = { queued: "queued", running: "running", succeeded: "succeeded", failed: "failed", cancelled: "failed" };
      return res.status(200).json({
        status: map[data.status] || "running",
        videoUrl: data.content?.video_url,
        error: data.error?.message
      });
    }

    if (engine === "kling21") {
      if (!hasKling()) return res.status(501).json({ error: "not configured" });
      const data = await upstreamJson(`${KLING_BASE}/v1/videos/text2video/${id}`, {
        headers: { Authorization: `Bearer ${klingToken()}` }
      });
      const st = data.data?.task_status;
      const map = { submitted: "queued", processing: "running", succeed: "succeeded", failed: "failed" };
      return res.status(200).json({
        status: map[st] || "running",
        videoUrl: data.data?.task_result?.videos?.[0]?.url,
        error: data.data?.task_status_msg
      });
    }

    return res.status(400).json({ error: "unknown engine" });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
