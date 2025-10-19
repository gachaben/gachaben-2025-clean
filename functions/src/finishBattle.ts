// ------------------------------------------------------
// functions/src/finishBattle.ts（DP対応・PW完全削除）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";
import { Timestamp } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true, methods: ["GET", "POST", "OPTIONS"] });

export const finishBattle = onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).send("");
      }

      console.log("🏁 finishBattle 呼び出し開始");

      const { battleId, result, userId } = req.body || {};
      if (!battleId) throw new Error("battleId が未指定です");
      if (!userId) throw new Error("userId が未指定です");

      // ✅ バトル結果を更新
      const battleRef = db.collection("battles").doc(battleId);
      await battleRef.update({
        result: result || "unknown",
        finishedAt: Timestamp.now(),
      });

      // ✅ DP（ドレミポイント）加算
      const userRef = db.collection("users").doc(userId);
      const userSnap = await userRef.get();
      const currentDP = userSnap.exists ? userSnap.data()?.doremiPoints || 0 : 0;
      const addDP = result === "win" ? 10 : 5;
      const newDP = currentDP + addDP;

      await userRef.set(
        { doremiPoints: newDP, updatedAt: Timestamp.now() },
        { merge: true }
      );

      console.log(`🎵 DP更新完了: ${currentDP} → ${newDP}`);

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        message: `Battle finished ✅ (+${addDP} DP)`,
        battleId,
        doremiPoints: newDP,
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
