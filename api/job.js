/* GET /api/job?id=…&engine=seedance|kling21 — poll an upstream job.
   On success: stores the video URL on the job row.
   On failure: refunds the job's cost exactly once (status running → refunded).
   Returns: { status, videoUrl?, error?, refunded? } */
import {
  ARK_BASE, KLING_BASE,
  hasSeedance, hasKling, klingToken, upstreamJson
} from "./_lib.js";
import { hasAuthBackend, addCredits, updateRows } from "./_auth.js";

async function settleJob(jobId, outcome, videoUrl) {
  if (!hasAuthBackend()) return false;
  try {
    if (outcome === "succeeded") {
      await updateRows("render_jobs", `id=eq.${encodeURIComponent(jobId)}&status=eq.running`, {
        status: "done",
        video_url: videoUrl || null
      });
      return false;
    }
    // failed: flip running → refunded atomically, refund only if we won the flip
    const rows = await updateRows("render_jobs", `id=eq.${encodeURIComponent(jobId)}&status=eq.running`, {
      status: "refunded"
    });
    if (rows.length > 0) {
      await addCredits(rows[0].user_id, rows[0].cost);
      return true;
    }
  } catch {
    /* settlement is best-effort; polling continues to work without it */
  }
  return false;
}

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
      const status = map[data.status] || "running";
      const videoUrl = data.content?.video_url;
      let refunded = false;
      if (status === "succeeded") await settleJob(id, "succeeded", videoUrl);
      if (status === "failed") refunded = await settleJob(id, "failed");
      return res.status(200).json({ status, videoUrl, error: data.error?.message, refunded });
    }

    if (engine === "kling21") {
      if (!hasKling()) return res.status(501).json({ error: "not configured" });
      const data = await upstreamJson(`${KLING_BASE}/v1/videos/text2video/${id}`, {
        headers: { Authorization: `Bearer ${klingToken()}` }
      });
      const st = data.data?.task_status;
      const map = { submitted: "queued", processing: "running", succeed: "succeeded", failed: "failed" };
      const status = map[st] || "running";
      const videoUrl = data.data?.task_result?.videos?.[0]?.url;
      let refunded = false;
      if (status === "succeeded") await settleJob(id, "succeeded", videoUrl);
      if (status === "failed") refunded = await settleJob(id, "failed");
      return res.status(200).json({ status, videoUrl, error: data.data?.task_status_msg, refunded });
    }

    return res.status(400).json({ error: "unknown engine" });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
