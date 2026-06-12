/* Durable video storage on Supabase Storage (private `renders` bucket).
   Engine CDN links expire within hours — finished renders are archived
   here and served via signed URLs. Swap this module to point at another
   provider (TOS / OSS / R2) without touching the rest of the API. */
import { SUPA_URL } from "./_auth.js";

const SECRET = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "renders";

/* Stream a finished render from the engine CDN into the bucket.
   Returns the storage path. */
export async function storeRender(userId, jobId, sourceUrl) {
  const src = await fetch(sourceUrl);
  if (!src.ok || !src.body) throw new Error(`source fetch ${src.status}`);
  const path = `${userId}/${String(jobId).replace(/[^\w.-]/g, "_")}.mp4`;
  const up = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      apikey: SECRET,
      "Content-Type": "video/mp4",
      "x-upsert": "true"
    },
    body: src.body,
    duplex: "half"
  });
  if (!up.ok) throw new Error(`store ${up.status}: ${(await up.text()).slice(0, 120)}`);
  return path;
}

/* Mint a signed playback/download URL for an archived render. */
export async function signRender(path, expiresIn = 60 * 60 * 24 * 30) {
  const r = await fetch(`${SUPA_URL}/storage/v1/object/sign/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET}`,
      apikey: SECRET,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expiresIn })
  });
  if (!r.ok) throw new Error(`sign ${r.status}`);
  const { signedURL } = await r.json();
  return `${SUPA_URL}/storage/v1${signedURL}`;
}
