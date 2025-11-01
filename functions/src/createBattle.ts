// ------------------------------------------------------
// functions/src/createBattle.ts（🔥 完全安定版 / Firebase Admin v12対応）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore"; // ✅ ←重要！

// ✅ Firestore Emulator / Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gachaben-2025-clean", // ← .env.local と一致
  });
  console.log("✅ Admin initialized (createBattle.ts)");
}

// ✅ Firestore 取得（admin.firestore() ではなく getFirestore()）
const db = getFirestore();

// ✅ createBattle 関数
export const createBattle = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const { uid, cpuLevel } = req.body || {};
    if (!uid) throw new Error("uid が未指定です");

    const battleRef = db.collection("battles").doc(`battle-${Date.now()}`);

    await battleRef.set({
      uid,
      cpuLevel: cpuLevel || "N",
      rounds: [],
      status: "ready",
      createdAt: FieldValue.serverTimestamp(), // ✅ ←新仕様対応済み
      updatedAt: Timestamp.now(),
    });

    console.log(`[createBattle] ✅ Created: ${battleRef.id}`);

    res.status(200).json({
      ok: true,
      msg: "createBattle success ✅",
      battleId: battleRef.id,
    });
  } catch (error: any) {
    console.error("[createBattle] Error:", error);
    res.status(500).json({
      ok: false,
      msg: "createBattle Error",
      error: error.message,
    });
  }
});
