// ------------------------------------------------------
// commitRound.ts（バトル中のラウンド結果保存 / Emulator完全対応）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { Timestamp } from "firebase-admin/firestore";
import cors from "cors";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const corsHandler = cors({ origin: true });

export const commitRound = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      console.log("🎯 commitRound 呼び出し開始");
      console.log("🧩 受信データ:", req.body);

      const body = req.body || {};
      const { battleId, round, userAnswer, cpuAnswer, winner } = body;

      if (!battleId) throw new Error("❌ battleId is required");

      const createdAt = Timestamp.now();

      const roundRef = await db
        .collection("battles")
        .doc(battleId)
        .collection("rounds")
        .add({
          round: round ?? 0,
          userAnswer: userAnswer ?? null,
          cpuAnswer: cpuAnswer ?? null,
          winner: winner ?? "none",
          createdAt,
        });

      console.log("✅ Round saved:", roundRef.id);
      res.status(200).json({
        message: "Round committed ✅",
        roundId: roundRef.id,
      });
    } catch (err: any) {
      console.error("🔥 commitRound Error:", err.message);
      res.status(500).json({
        error: err.message,
        stack: err.stack,
      });
    }
  });
});
