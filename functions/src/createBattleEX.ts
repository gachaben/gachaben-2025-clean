// ------------------------------------------------------
// ⚔️ createBattleEX.ts（7問制バトル初期化）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { Request, Response } from "express";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const createBattleEX = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      res.status(400).json({ error: "Missing uid" });
      return;
    }

    const battleRef = db.collection("battles").doc();
    const battleId = battleRef.id;

    const battleData = {
      uid,
      battleId,
      score: 0,
      dp: 0,
      streak: 0,
      continueStreak: false,
      bonusEligible: false,
      status: "playing",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await battleRef.set(battleData);
    console.log(`✅ BattleEX created: ${battleId}`);

    res.status(200).json(battleData);
  } catch (err: any) {
    console.error("❌ createBattleEX error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};
