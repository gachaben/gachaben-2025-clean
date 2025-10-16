"use strict";
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
// ------------------------------------------------------
// createBattle.ts（完全動作版 / Timestamp安全対応）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// ✅ Timestamp安全取得（v13以降対応）
const getNow = () => {
    try {
        return admin.firestore.Timestamp.now();
    }
    catch {
        return new Date();
    }
};
exports.createBattle = (0, https_1.onCall)({ cors: true }, async (req) => {
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
        await userRef.set({
            tickets: currentTickets - 1,
            lastBattleAt: now,
        }, { merge: true });
        console.log("✅ Battle created:", battleRef.id);
        return {
            battleId: battleRef.id,
            message: "Battle created successfully ✅",
        };
    }
    catch (err) {
        console.error("🔥 createBattle Error:", err);
        throw new Error(err.message || "Internal Server Error");
    }
});
