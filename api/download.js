/* GET /api/download?url=…&name=… — stream an upstream render to the browser
   as an attachment. Needed because engine CDNs (Volcano TOS / Kling) don't
   send CORS headers, so the client can't blob-download them directly.
   Streams chunk-by-chunk to stay clear of the function response-size limit. */
import { Readable } from "node:stream";

const ALLOWED_HOSTS = [/\.volces\.com$/i, /\.klingai\.com$/i, /\.supabase\.co$/i];

export default async function handler(req, res) {
  const { url, name } = req.query || {};
  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: "invalid url" });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.some((re) => re.test(target.hostname))) {
    return res.status(400).json({ error: "host not allowed" });
  }

  const upstream = await fetch(target, { redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: `upstream ${upstream.status} — link may have expired, re-render to get a fresh one` });
  }

  const safeName = String(name || "framemint-output.mp4").replace(/[^\w.-]/g, "_").slice(0, 80);
  res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp4");
  const len = upstream.headers.get("content-length");
  if (len) res.setHeader("Content-Length", len);
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  Readable.fromWeb(upstream.body).pipe(res);
}
