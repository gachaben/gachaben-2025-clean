// ------------------------------------------------------
// functions/src/createBattle.ts（v1.7b最終版）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true, methods: ["GET", "POST", "OPTIONS"] });

export const createBattle = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
      }

      console.log("🎯 createBattle 呼び出し");

      const { uid } = req.body || {};
      if (!uid) throw new Error("uid が未指定です");

      const ref = await db.collection("battles").add({
        userId: uid,
        opponentId: "cpu-normal",
        cpuLevel: "N",
        result: "pending",
        createdAt: Timestamp.now(),
      });

      console.log("✅ Battle created:", ref.id);

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        message: "Battle created ✅",
        battleId: ref.id,
      });
    } catch (err: any) {
      console.error("🔥 createBattle Error:", err);
      res.set("Access-Control-Allow-Origin", "*");
      res.status(500).json({
        error: err.message,
        stack: err.stack,
      });
    }
  });
});
