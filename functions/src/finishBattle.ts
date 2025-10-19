// ------------------------------------------------------
// functions/src/finishBattle.ts（最終安定安定版 / JSON安全対応）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ✅ CORSハンドラ
const corsHandler = cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
});

export const finishBattle = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      // ✅ OPTIONS（プリフライト）
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
      }

      console.log("🏁 finishBattle 呼び出し開始");

      // ✅ JSONボディ対策（Emulatorでreq.bodyが文字列になることがある）
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { battleId, result } = body;

      if (!battleId) throw new Error("battleId が未指定です");

      const ref = db.collection("battles").doc(battleId);
      const snap = await ref.get();

      // ✅ Emulator 判定（確実・安全版）
      const isLocal =
        !!process.env.FUNCTIONS_EMULATOR ||
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST ||
        !!process.env.FIRESTORE_EMULATOR_HOST ||
        !!process.env.FIREBASE_EMULATOR_HUB ||
        (process.env.GCLOUD_PROJECT?.includes("demo") ?? false);

      console.log("🔍 Emulator判定:", {
        FUNCTIONS_EMULATOR: process.env.FUNCTIONS_EMULATOR,
        FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST,
        GCLOUD_PROJECT: process.env.GCLOUD_PROJECT,
        isLocal,
      });

      // ✅ ドキュメント存在チェック
      if (!snap.exists) {
        if (isLocal) {
          console.warn("⚠️ 該当Battleが存在しません → Emulatorなので自動作成します");
          await ref.set({
            result: result || "unknown",
            finishedAt: Timestamp.now(),
            autoCreated: true,
          });
        } else {
          throw new Error(`Battle (${battleId}) が存在しません`);
        }
      } else {
        await ref.update({
          result: result || "unknown",
          finishedAt: Timestamp.now(),
        });
      }

      // ✅ レスポンス返却
      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        message: "Battle finished ✅",
        battleId,
        mode: isLocal ? "local-auto" : "production-safe",
      });
    } catch (err: any) {
      console.error("🔥 finishBattle Error:", err);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({
        error: err.message,
        stack: err.stack,
      });
    }
  });
});
