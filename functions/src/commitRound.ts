// ------------------------------------------------------
// functions/src/commitRound.ts（FieldValue安全版）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { Request, Response } from "express";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const commitRound = async (req: Request, res: Response) => {
  try {
    const { battleId, uid } = req.body;

    if (!battleId || !uid) {
      res.status(400).json({ ok: false, msg: "battleId or uid missing" });
      return;
    }

    const battleRef = db.collection("battles").doc(battleId);

    // ✅ FieldValue が undefined の場合も安全に fallback
    const fieldValue =
      admin.firestore?.FieldValue?.serverTimestamp?.() ?? new Date();

    await battleRef.update({
      lastCommit: new Date(),
      updatedAt: fieldValue,
    });

    res.status(200).json({
      ok: true,
      msg: "commitRound OK",
      battleId,
      time: Date.now(),
    });
  } catch (err) {
    console.error("[commitRoundFn] Error:", err);
    res.status(500).json({
      ok: false,
      msg: "Internal Server Error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
