/* Supabase helpers for the API layer.
   Env vars (Vercel):
     SUPABASE_URL          project URL (public)
     SUPABASE_ANON_KEY     publishable key (public, used to verify user tokens)
     SUPABASE_SECRET_KEY   service-role/secret key — server only, never shipped to the client
*/
export const SUPA_URL =
  process.env.SUPABASE_URL || "https://ghmigcdqggaksksnxkav.supabase.co";
export const SUPA_ANON =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_4uuO1uBClB73dfpcj3oi2Q_4PY1K9YM";
const SECRET = process.env.SUPABASE_SECRET_KEY;

export const hasAuthBackend = () => Boolean(SECRET);

/* Resolve the logged-in user from the request's bearer token. */
export async function getUser(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  const res = await fetch(`${SUPA_URL}/auth/v1/user`, {
    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const user = await res.json();
  return user?.id ? user : null;
}

/* ---- service-role data access (PostgREST) ---- */
function svcHeaders(extra = {}) {
  return {
    apikey: SECRET,
    Authorization: `Bearer ${SECRET}`,
    "Content-Type": "application/json",
    ...extra
  };
}

export async function rpc(name, args) {
  const res = await fetch(`${SUPA_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: svcHeaders(),
    body: JSON.stringify(args)
  });
  if (!res.ok) throw new Error(`rpc ${name}: ${res.status} ${await res.text()}`);
  return res.json();
}

/* Atomic spend; returns new balance or -1 when balance is insufficient. */
export const spendCredits = (userId, cost) =>
  rpc("spend_credits", { p_user: userId, p_cost: cost });
export const addCredits = (userId, amount) =>
  rpc("add_credits", { p_user: userId, p_amount: amount });

export async function insertRow(table, row) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: svcHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(row)
  });
  if (!res.ok) throw new Error(`insert ${table}: ${res.status} ${await res.text()}`);
}

/* Conditional update; returns the updated rows (empty array if the
   where-clause matched nothing) so callers can act exactly once. */
export async function updateRows(table, query, patch) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: svcHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(`update ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}
