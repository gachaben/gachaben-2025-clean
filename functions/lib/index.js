"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBattle = void 0;
// ------------------------------------------------------
// ⚔️ index.ts（v2.1 完全統合版）
// Firebase Functions Entry Point
// ------------------------------------------------------
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// ------------------------------------------------------
// ✅ Firebase 初期設定
// ------------------------------------------------------
(0, v2_1.setGlobalOptions)({ region: "asia-northeast1" });
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// ------------------------------------------------------
// ⚔️ createBattle（バトル券チェック＋消費＋初期化）
// ------------------------------------------------------
exports.createBattle = (0, https_1.onCall)(async (req) => {
    const auth = req.auth;
    if (!auth)
        throw new https_1.HttpsError("unauthenticated", "サインインが必要です。");
    const { selectedItemId, questionCount } = req.data || {};
    if (!selectedItemId || !questionCount) {
        throw new https_1.HttpsError("invalid-argument", "selectedItemId と questionCount は必須です。");
    }
    const userRef = db.collection("users").doc(auth.uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new https_1.HttpsError("not-found", "ユーザーが存在しません。");
    }
    const userData = userSnap.data() || {};
    const currentTickets = userData.tickets ?? 0;
    // 🎫 チケットが不足していたらエラー
    if (currentTickets <= 0) {
        throw new https_1.HttpsError("failed-precondition", "バトル券が足りません。チャレンジ問題か広告で入手してください。");
    }
    // 🎫 バトル券を1枚消費
    await userRef.update({
        tickets: firestore_1.FieldValue.increment(-1),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    // CPUデータ生成
    const cpuItemId = `cpu_${selectedItemId}`;
    const seed = Math.random().toString(36).slice(2, 10);
    const now = firestore_1.FieldValue.serverTimestamp();
    // バトル初期データ
    const battleRef = db.collection("battles").doc();
    const init = {
        ownerUid: auth.uid,
        selectedItemId,
        enemyItemId: cpuItemId,
        enemyType: "CPU",
        questionCount,
        seed,
        phase: "enemyPick",
        round: 1,
        myPwLeft: 300,
        enemyPwLeft: 300,
        myBet: null,
        enemyBet: null,
        currentQuestionId: null,
        createdAt: now,
        updatedAt: now,
    };
    await battleRef.set(init);
    console.log(`🎫 バトル券を1枚消費 (${currentTickets - 1} 枚残り) [uid=${auth.uid}]`);
    console.log(`⚔️ 新規バトル作成: ${battleRef.id}`);
    return { battleId: battleRef.id, ticketsLeft: currentTickets - 1 };
});
