// ------------------------------------------------------
// functions/src/finishBattle.ts（Timestamp修正版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ✅ Timestamp 安全取得
const Timestamp = admin.firestore?.Timestamp || { now: () => new Date() };

export const finishBattle = async (req: functions.https.Request, res: functions.Response) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const { battleId } = req.body;
    if (!battleId) throw new Error("Missing battleId");

    const ref = db.collection("battles").doc(battleId);
    const now = typeof Timestamp.now === "function" ? Timestamp.now() : new Date();

    await ref.update({
      status: "finished",
      updatedAt: now,
    });

    res.status(200).json({
      ok: true,
      msg: "Firestore finish success",
      battleId,
    });
  } catch (err) {
    console.error("[finishBattle Error]", err);
    res.status(500).json({
      ok: false,
      msg: "Firestore update failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
