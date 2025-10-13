"use strict";
// ------------------------------------------------------
// 🎮 createBattle（v1.7b対応 / Emulator CORS対応）
// バトル開始時に Firestore に試合データを自動生成する関数
// ------------------------------------------------------
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBattle = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
// ✅ Firebase Admin 初期化
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// ✅ onCall（CORS自動許可付き）
exports.createBattle = (0, https_1.onCall)({ cors: true }, async (req) => {
    const uid = req.auth?.uid;
    if (!uid)
        throw new Error("unauthenticated");
    // データ受取
    const { opponentId = "cpu-normal", cpuLevel = "N", startPw = 1000 } = req.data || {};
    // 新しいドキュメントIDを発行
    const battleRef = db.collection("battles").doc();
    // バトル初期データ
    const battleData = {
        userId: uid,
        opponentId,
        mode: "7q", // v1.7b: 7問制
        cpuLevel,
        rounds: [],
        userPwStart: startPw,
        cpuPwStart: startPw,
        userPwNow: startPw,
        cpuPwNow: startPw,
        winner: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    // Firestoreに登録
    await battleRef.set(battleData);
    // バトルチケットを1枚消費
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
