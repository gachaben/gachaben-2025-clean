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
exports.finishBattle = void 0;
// ------------------------------------------------------
// functions/src/finishBattle.ts
// Firebase Cloud Functions: 勝敗集計＆結果保存
// ------------------------------------------------------
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.finishBattle = functions.https.onCall(async (data, context) => {
    try {
        // ✅ dataの型を明示
        const { battleId, userId } = data;
        if (!battleId || !userId) {
            throw new functions.https.HttpsError("invalid-argument", "battleId and userId are required");
        }
        const battleRef = db.collection("battles").doc(battleId);
        const roundsSnap = await battleRef.collection("rounds").get();
        let userScore = 0;
        let cpuScore = 0;
        roundsSnap.forEach((r) => {
            const d = r.data();
            if (d.winner === "user")
                userScore++;
            if (d.winner === "cpu")
                cpuScore++;
        });
        const result = userScore > cpuScore
            ? "userWin"
            : userScore < cpuScore
                ? "cpuWin"
                : "draw";
        await battleRef.update({
            result,
            finishedAt: admin.firestore.FieldValue.serverTimestamp(),
            userScore,
            cpuScore,
        });
        await db.collection("results").add({
            battleId,
            userId,
            result,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { status: "ok", result };
    }
    catch (error) {
        console.error("finishBattle error:", error);
        throw new functions.https.HttpsError("internal", "finishBattle failed");
    }
});
