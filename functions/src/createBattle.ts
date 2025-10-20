// ------------------------------------------------------
// functions/src/createBattle.ts（Firestore Emulator接続版・型エラー完全回避版）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { Timestamp } from "firebase-admin/firestore";
// ✅ 型の衝突を避けるため require() を使用
const cors = require("cors");

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gachaben-2025-clean", // ← 重要（必ず残す）
  });
}

const db = admin.firestore();

// ✅ CORS ハンドラー（localhost許可）
const corsHandler = cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// ✅ createBattle 関数
export const createBattle = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const userId = "test-user"; // 仮のユーザーID
      const battleRef = db.collection("battles").doc();

      await battleRef.set({
        userId,
        opponentId: "cpu-normal",
        cpuLevel: "N",
        result: "pending",
        createdAt: Timestamp.now(),
      });

      res.status(200).json({
        ok: true,
        msg: "Battle created ✅",
        battleId: battleRef.id,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        stack: error.stack,
      });
    }
  });
});
