"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBattle = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, v2_1.setGlobalOptions)({ region: "asia-northeast1" }); // お好みのリージョンでOK
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
exports.createBattle = (0, https_1.onCall)(async (req) => {
    const auth = req.auth;
    if (!auth)
        throw new https_1.HttpsError("unauthenticated", "Sign in required.");
    const { selectedItemId, questionCount } = req.data || {};
    if (!selectedItemId || !questionCount) {
        throw new https_1.HttpsError("invalid-argument", "selectedItemId & questionCount required.");
    }
    // 必要なら items 参照で存在チェック
    // const itemSnap = await db.collection("items").doc(selectedItemId).get();
    const cpuItemId = `cpu_${selectedItemId}`;
    const seed = Math.random().toString(36).slice(2, 10);
    const battleRef = db.collection("battles").doc();
    const now = firestore_1.FieldValue.serverTimestamp();
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
        updatedAt: now
    };
    await battleRef.set(init);
    return { battleId: battleRef.id };
});
