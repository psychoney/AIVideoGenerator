/* POST /api/recharge — top up credits.
   Body: { pack: "starter" | "creator" | "studio" }
   NOTE: payment is SIMULATED for now — credits are granted immediately and
   the order is recorded as paid_simulated. Swap the marked block for a real
   PSP (Stripe / Alipay / WeChat Pay) checkout + webhook before charging money.
   Returns: { credits, balance } */
import { getUser, hasAuthBackend, addCredits, insertRow } from "./_auth.js";

const PACKS = {
  starter: { credits: 300, label: "STARTER PACK" },
  creator: { credits: 1200, label: "CREATOR PACK" },
  studio: { credits: 5000, label: "STUDIO PACK" }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }
  if (!hasAuthBackend()) {
    return res.status(501).json({ error: "auth backend not configured" });
  }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "sign in required" });

  const pack = PACKS[req.body?.pack];
  if (!pack) return res.status(400).json({ error: "unknown pack" });

  try {
    /* ---- SIMULATED PAYMENT — replace with real PSP checkout ---- */
    const balance = await addCredits(user.id, pack.credits);
    await insertRow("credit_orders", {
      user_id: user.id,
      pack: pack.label,
      credits: pack.credits,
      status: "paid_simulated"
    }).catch(() => {});
    /* ------------------------------------------------------------ */
    return res.status(200).json({ credits: pack.credits, balance });
  } catch (e) {
    return res.status(502).json({ error: String(e.message || e) });
  }
}
