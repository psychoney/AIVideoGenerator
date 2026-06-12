/* GET /api/job?id=…&engine=seedance|kling21 — poll an upstream job.
   On success: archives the video to durable storage (engine links expire
   fast) and returns a long-lived signed URL.
   On failure: refunds the job's cost exactly once (status running → refunded).
   Returns: { status, videoUrl?, error?, refunded? } */
import {
  ARK_BASE, KLING_BASE,
  hasSeedance, hasKling, klingToken, upstreamJson
} from "./_lib.js";
import { hasAuthBackend, addCredits, updateRows, fetchRows } from "./_auth.js";
import { storeRender, signRender } from "./_store.js";

/* Settle a finished job. Only the request that wins the running→done flip
   does the archive/refund work, so it happens exactly once. */
async function settleJob(jobId, outcome, engineUrl) {
  if (!hasAuthBackend()) return {};
  try {
    const rows = await updateRows(
      "render_jobs",
      `id=eq.${encodeURIComponent(jobId)}&status=eq.running`,
      { status: outcome === "succeeded" ? "done" : "refunded" }
    );
    if (rows.length === 0) {
      // already settled — if it was archived, hand back a fresh signed URL
      const done = await fetchRows(
        "render_jobs",
        `id=eq.${encodeURIComponent(jobId)}&select=video_url`
      );
      const stored = done[0]?.video_url;
      if (stored?.startsWith("sb://")) {
        return { archivedUrl: await signRender(stored.slice(5)) };
      }
      return {};
    }

    if (outcome === "succeeded") {
      try {
        const path = await storeRender(rows[0].user_id, jobId, engineUrl);
        await updateRows("render_jobs", `id=eq.${encodeURIComponent(jobId)}`, {
          video_url: `sb://${path}`
        });
        return { archivedUrl: await signRender(path) };
      } catch {
        // archive is best-effort — fall back to the (short-lived) engine URL
        await updateRows("render_jobs", `id=eq.${encodeURIComponent(jobId)}`, {
          video_url: engineUrl
        }).catch(() => {});
        return {};
      }
    }

    await addCredits(rows[0].user_id, rows[0].cost);
    return { refunded: true };
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const { id, engine } = req.query || {};
  if (!id || !engine) {
    return res.status(400).json({ error: "id and engine required" });
  }

  try {
    let status, videoUrl, error;

    if (engine === "seedance") {
      if (!hasSeedance()) return res.status(501).json({ error: "not configured" });
      const data = await upstreamJson(`${ARK_BASE}/contents/generations/tasks/${id}`, {
        headers: { Authorization: `Bearer ${process.env.ARK_API_KEY}` }
      });
      const map = { queued: "queued", running: "running", succeeded: "succeeded", failed: "failed", cancelled: "failed" };
      status = map[data.status] || "running";
      videoUrl = data.content?.video_url;
      error = data.error?.message;
    } else if (engine === "kling21") {
      if (!hasKling()) return res.status(501).json({ error: "not configured" });
      const data = await upstreamJson(`${KLING_BASE}/v1/videos/text2video/${id}`, {
        headers: { Authorization: `Bearer ${klingToken()}` }
      });
      const map = { submitted: "queued", processing: "running", succeed: "succeeded", failed: "failed" };
      status = map[data.data?.task_status] || "running";
      videoUrl = data.data?.task_result?.videos?.[0]?.url;
      error = data.data?.task_status_msg;
    } else {
      return res.status(400).json({ error: "unknown engine" });
    }

    let refunded = false;
    if (status === "succeeded" && videoUrl) {
      const settled = await settleJob(id, "succeeded", videoUrl);
      if (settled.archivedUrl) videoUrl = settled.archivedUrl;
    } else if (status === "failed") {
      refunded = Boolean((await settleJob(id, "failed")).refunded);
    }
    return res.status(200).json({ status, videoUrl, error, refunded });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
