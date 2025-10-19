// ------------------------------------------------------
// createBattle.ts（完全動作版 / Timestamp安全対応）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// ✅ Timestamp安全取得（v13以降対応）
const getNow = () => {
  try {
    return (admin.firestore as any).Timestamp.now();
  } catch {
    return new Date();
  }
};

export const createBattle = onCall({ cors: true }, async (req) => {
  try {
    let uid = req.auth?.uid;
    if (!uid) {
      uid = "demo-user-001";
      console.log("🧩 Emulatorモード: uidをデモ値に設定 →", uid);
    }

    const { opponentId = "cpu-normal", cpuLevel = "N", startPw = 1000 } = req.data || {};

    const battleRef = db.collection("battles").doc();
    const now = getNow();

    const battleData = {
      userId: uid,
      opponentId,
      mode: "7q",
      cpuLevel,
      rounds: [],
      userPwStart: startPw,
      cpuPwStart: startPw,
      userPwNow: startPw,
      cpuPwNow: startPw,
      winner: null,
      createdAt: now,
    };

    await battleRef.set(battleData);

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const currentTickets = (userSnap.exists ? userSnap.data()?.tickets : 5) ?? 5;

    await userRef.set(
      {
        tickets: currentTickets - 1,
        lastBattleAt: now,
      },
      { merge: true }
    );

    console.log("✅ Battle created:", battleRef.id);
    return {
      battleId: battleRef.id,
      message: "Battle created successfully ✅",
    };
  } catch (err: any) {
    console.error("🔥 createBattle Error:", err);
    throw new Error(err.message || "Internal Server Error");
  }
});
