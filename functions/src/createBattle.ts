// ------------------------------------------------------
// functions/src/commitRound.ts（Firestore更新テスト版 / 型エラー修正版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const commitRoundFn = functions.https.onRequest(async (req, res): Promise<void> => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  try {
    const { battleId } = req.body;
    if (!battleId) throw new Error("Missing battleId");

    const ref = db.collection("battles").doc(battleId);

    // ✅ Firestore のドキュメントを更新
    await ref.update({
      status: "round-updated",
      lastCommit: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    // ✅ res.json() は戻り値ではなく “呼び出して終わり”
    res.status(200).json({
      ok: true,
      msg: "commitRoundFn → Firestore更新成功",
      battleId,
    });
  } catch (err) {
    console.error("[commitRoundFn Error]", err);
    res.status(500).json({
      ok: false,
      msg: "Firestore更新失敗",
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
