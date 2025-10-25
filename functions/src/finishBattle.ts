// ------------------------------------------------------
// functions/src/finishBattle.ts（タイブレーク対応版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// ------------------------------------------------------
// finishBattleFn：7問終了後に最終処理 or タイブレーク実施
// ------------------------------------------------------
export const finishBattleFn = functions.https.onRequest(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const { battleId, userScore, genre, tieBreak } = req.body;
    if (!battleId) throw new Error("battleId missing");

    const battleRef = db.collection("battles").doc(battleId);
    const battleSnap = await battleRef.get();
    if (!battleSnap.exists) throw new Error("Battle not found");

    // ------------------------------------------------------
    // 通常バトル終了 → タイブレークなし
    // ------------------------------------------------------
    if (!tieBreak) {
      await battleRef.update({
        userScore,
        status: "finished",
        winner: userScore >= 4 ? "user" : "cpu",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      res.json({ ok: true, msg: "Battle finished (no tiebreak)" });
      return;
    }

    // ------------------------------------------------------
    // 🧠 タイブレークモード
    // ------------------------------------------------------
    const genreRef = db.collection("problems").where("genre", "==", genre);
    const genreSnap = await genreRef.get();

    let avgScore = 6; // デフォルト：平均がない場合は6問正解
    if (!genreSnap.empty) {
      // 平均正答率から10問換算
      let totalRate = 0;
      genreSnap.forEach((doc) => {
        const data = doc.data();
        if (typeof data.averageRate === "number") totalRate += data.averageRate;
      });
      const avgRate = totalRate / genreSnap.size;
      avgScore = Math.round(avgRate * 10); // 例：平均0.63 → 6問
    }

    // CPUの目標スコア（平均値 ±1 の範囲でゆらぎ）
    const cpuScore = Math.max(
      0,
      Math.min(10, avgScore + Math.floor(Math.random() * 3) - 1)
    );

    // 🧮 勝敗判定
    let winner: "user" | "cpu" = "cpu";
    if (userScore > cpuScore) winner = "user";
    else if (userScore === cpuScore) winner = Math.random() < 0.5 ? "user" : "cpu";

    // Firestoreに保存
    await battleRef.update({
      status: "finished",
      mode: "tieBreak",
      genre,
      tieBreak: {
        cpuScore,
        avgAtBattle: avgScore,
        userScore,
        winner,
      },
      winner,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // レスポンス
    res.json({
      ok: true,
      msg: "Battle finished with tieBreak",
      data: { cpuScore, avgScore, userScore, winner },
    });
  } catch (err) {
    console.error("[finishBattleFn] Error:", err);
    res.status(500).json({
      ok: false,
      msg: "Internal Server Error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
