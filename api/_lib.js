/* Shared upstream helpers for the render proxy.
   Keys live in Vercel env vars — never in the frontend:
     ARK_API_KEY          Volcano Ark (Doubao Seedance)
     SEEDANCE_MODEL       optional, defaults below
     KLING_ACCESS_KEY     Kling open platform AK
     KLING_SECRET_KEY     Kling open platform SK
     KLING_API_BASE       optional, defaults to the global endpoint
*/
import crypto from "node:crypto";

export const ARK_BASE = "https://ark.cn-beijing.volces.com/api/v3";
export const SEEDANCE_MODEL = process.env.SEEDANCE_MODEL || "doubao-seedance-1-0-pro-250528";
export const KLING_BASE = process.env.KLING_API_BASE || "https://api-singapore.klingai.com";

export function hasSeedance() {
  return Boolean(process.env.ARK_API_KEY);
}
export function hasKling() {
  return Boolean(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY);
}

/* Kling auths with a short-lived HS256 JWT signed by AK/SK. */
export function klingToken() {
  const b64 = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const header = b64({ alg: "HS256", typ: "JWT" });
  const payload = b64({
    iss: process.env.KLING_ACCESS_KEY,
    exp: now + 1800,
    nbf: now - 5
  });
  const sig = crypto
    .createHmac("sha256", process.env.KLING_SECRET_KEY)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${sig}`;
}

export async function upstreamJson(url, options) {
  const res = await fetch(url, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `upstream ${res.status}`;
    throw new Error(msg);
  }
  return body;
}
