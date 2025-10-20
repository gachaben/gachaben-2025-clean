// ------------------------------------------------------
// functions/src/finishBattle.ts（2025安定版）
// ------------------------------------------------------
import * as admin from "firebase-admin";

// ✅ Firestore インスタンス
const db = admin.firestore();

export const finishBattle = async (req: any, res: any) => {
  try {
    const { battleId } = req.body;
    if (!battleId) throw new Error("battleId が未指定です");

    await db.collection("battles").doc(battleId).update({
      result: "finished",
      finishedAt: new Date().toISOString(),
    });

    res.status(200).json({
      ok: true,
      msg: "Battle finished",
      battleId,
    });
  } catch (error: any) {
    console.error("🔥 finishBattle error:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
