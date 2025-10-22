import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const finishBattle = functions.https.onRequest(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    console.log("[finishBattle] received:", req.body);
    res.status(200).json({
      ok: true,
      msg: "finishBattle OK (placeholder)",
      received: req.body,
      time: Date.now(),
    });
  } catch (err) {
    console.error("[finishBattle] Error:", err);
    res.status(500).json({
      ok: false,
      msg: "Internal Server Error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
