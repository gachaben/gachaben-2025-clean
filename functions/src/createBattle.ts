// ------------------------------------------------------
// functions/src/createBattle.ts（完全安定版 / Timestamp修正）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { Request, Response } from "express";

// ✅ Firebase Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Admin initialized (createBattle)");
}

const db = admin.firestore();

// ✅ Timestamp を確実に取得
const Timestamp = admin.firestore?.Timestamp || {
  now: () => new Date(),
};

export const createBattle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.body;
    if (!uid) throw new Error("Missing uid");

    const ref = db.collection("battles").doc();
    const battleId = ref.id;

    // ✅ now() が存在しない場合にも fallback する
    const now = typeof Timestamp.now === "function" ? Timestamp.now() : new Date();

    await ref.set({
      battleId,
      uid,
      status: "waiting",
      createdAt: now,
      updatedAt: now,
      lastCommit: now,
    });

    res.status(200).json({
      ok: true,
      msg: "createBattle OK",
      battleId,
    });
  } catch (err) {
    console.error("[createBattle Error]", err);
    res.status(500).json({
      ok: false,
      msg: "Firestore create failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
