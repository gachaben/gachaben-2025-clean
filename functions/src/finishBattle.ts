// ------------------------------------------------------
// functions/src/finishBattle.ts
// Firebase Cloud Functions: 勝敗集計＆結果保存
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const finishBattle = functions.https.onCall(
  async (data: any, context) => {
    try {
      // ✅ dataの型を明示
      const { battleId, userId } = data as {
        battleId: string;
        userId: string;
      };

      if (!battleId || !userId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "battleId and userId are required"
        );
      }

      const battleRef = db.collection("battles").doc(battleId);
      const roundsSnap = await battleRef.collection("rounds").get();

      let userScore = 0;
      let cpuScore = 0;

      roundsSnap.forEach((r) => {
        const d = r.data();
        if (d.winner === "user") userScore++;
        if (d.winner === "cpu") cpuScore++;
      });

      const result =
        userScore > cpuScore
          ? "userWin"
          : userScore < cpuScore
          ? "cpuWin"
          : "draw";

      await battleRef.update({
        result,
        finishedAt: admin.firestore.FieldValue.serverTimestamp(),
        userScore,
        cpuScore,
      });

      await db.collection("results").add({
        battleId,
        userId,
        result,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { status: "ok", result };
    } catch (error) {
      console.error("finishBattle error:", error);
      throw new functions.https.HttpsError("internal", "finishBattle failed");
    }
  }
);
