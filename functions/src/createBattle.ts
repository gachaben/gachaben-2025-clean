import * as admin from "firebase-admin";
import { Request, Response } from "express";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const createBattle = async (req: Request, res: Response) => {
  try {
    const { uid } = req.body;
    if (!uid) {
      res.status(400).json({ ok: false, msg: "uid missing" });
      return;
    }

    // ✅ Timestampを確実に取得
    const battleRef = db.collection("battles").doc();
    const battleData = {
      battleId: battleRef.id,
      uid,
      createdAt: new Date(), // ← ← ← 一旦これでOK！（Timestamp.now()の代替）
      status: "waiting",
    };

    await battleRef.set(battleData);

    res.status(200).json({
      ok: true,
      msg: "createBattle OK",
      battleId: battleRef.id,
      time: Date.now(),
    });
  } catch (err) {
    console.error("[createBattleFn] Error:", err);
    res.status(500).json({
      ok: false,
      msg: "Internal Server Error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
