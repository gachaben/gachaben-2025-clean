// ------------------------------------------------------
// commitRound.ts（完全修正版 / CORS対応）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true, methods: ["GET", "POST", "OPTIONS"] });

export const commitRound = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
      }

      console.log("🎯 commitRound 呼び出し開始");
      const { battleId, roundData } = req.body || {};

      if (!battleId) throw new Error("battleId が未指定です");

      await db
        .collection("battles")
        .doc(battleId)
        .collection("rounds")
        .add({
          ...roundData,
          committedAt: Timestamp.now(),
        });

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({ message: "Round committed ✅" });
    } catch (err: any) {
      console.error("🔥 commitRound Error:", err);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({ error: err.message, stack: err.stack });
    }
  });
});
