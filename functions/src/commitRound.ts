// ------------------------------------------------------
// functions/src/commitRound.ts（Firestore Emulator完全対応版）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { FieldValue, Timestamp } from "firebase-admin/firestore"; // ✅ ← ここ重要

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gachaben-2025-clean",
  });
}

const db = admin.firestore();

// ✅ commitRound 関数
export const commitRound = functions.https.onRequest(async (req, res) => {
  try {
    const { battleId, roundData } = req.body;
    if (!battleId) throw new Error("battleId が未指定です");

    const battleRef = db.collection("battles").doc(battleId);
    const snap = await battleRef.get();
    if (!snap.exists) throw new Error("指定されたバトルが存在しません");

    // ✅ arrayUnion を直接 import から呼ぶ（admin.firestore 経由だと undefined になることがある）
    await battleRef.update({
      rounds: FieldValue.arrayUnion(roundData || { result: "test" }),
      updatedAt: Timestamp.now(),
    });

    res.status(200).json({
      ok: true,
      msg: "Round committed ✅",
      battleId,
    });
  } catch (error: any) {
    console.error("commitRound error:", error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});
