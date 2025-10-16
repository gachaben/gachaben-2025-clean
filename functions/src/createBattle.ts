// ------------------------------------------------------
// createBattle.ts（完全修正版 / v13 + Emulator OK）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore"; // ✅ ← これがポイント！

if (!admin.apps.length) {
  admin.initializeApp();
  console.log("🔥 Firebase Admin initialized");
}

const db = admin.firestore();
const corsHandler = cors({ origin: true });

export const createBattle = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      console.log("🧩 createBattle 呼び出し開始");
      console.log("📦 req.body:", req.body);

      const uid = req.body?.uid || "demo-user-001";
      const { opponentId = "cpu-normal", cpuLevel = "N", startPw = 1000 } =
        req.body || {};

      console.log("🧠 受信データ:", { uid, opponentId, cpuLevel, startPw });

      const battleRef = await db.collection("battles").add({
        userId: uid,
        opponentId,
        cpuLevel,
        startPw,
        createdAt: Timestamp.now(), // ✅ ← これが確実に動作する
      });

      console.log("✅ Battle created:", battleRef.id);
      res.status(200).json({
        battleId: battleRef.id,
        message: "Battle created ✅",
      });
    } catch (err: any) {
      console.error("🔥 createBattle Error:", err);
      res.status(500).json({
        error: err.message,
        stack: err.stack,
      });
    }
  });
});
