// ------------------------------------------------------
// 🎮 createBattle（v1.7b対応）
// バトル開始時に Firestore に試合データを自動生成する関数
// ------------------------------------------------------

import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const createBattle = onCall(async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new Error("unauthenticated");

  // データ受取（必要に応じて opponentId や CPUレベルを渡す）
  const { opponentId = "cpu-normal", cpuLevel = "N", startPw = 1000 } = req.data || {};

  // 新しいドキュメントIDを発行
  const battleRef = db.collection("battles").doc();

  // バトル初期データ
  const battleData = {
    userId: uid,
    opponentId,
    mode: "7q", // v1.7b: 7問制
    cpuLevel,
    rounds: [], // 各問データを後で commitRound で追加
    userPwStart: startPw,
    cpuPwStart: startPw,
    userPwNow: startPw,
    cpuPwNow: startPw,
    winner: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Firestoreに登録
  await battleRef.set(battleData);

  // バトルチケットを1枚消費（7枚制）
  const userRef = db.collection("users").doc(uid);
  await userRef.update({
    tickets: admin.firestore.FieldValue.increment(-1),
    lastBattleAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    battleId: battleRef.id,
    message: "Battle created successfully",
  };
});
