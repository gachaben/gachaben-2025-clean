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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitRound = void 0;
// ------------------------------------------------------
// commitRound.ts（バトル中のラウンド結果保存 / Emulator完全対応）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const cors_1 = __importDefault(require("cors"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
exports.commitRound = (0, https_1.onRequest)((req, res) => {
    corsHandler(req, res, async () => {
        try {
            console.log("🎯 commitRound 呼び出し開始");
            console.log("🧩 受信データ:", req.body);
            const body = req.body || {};
            const { battleId, round, userAnswer, cpuAnswer, winner } = body;
            if (!battleId)
                throw new Error("❌ battleId is required");
            const createdAt = firestore_1.Timestamp.now();
            const roundRef = await db
                .collection("battles")
                .doc(battleId)
                .collection("rounds")
                .add({
                round: round ?? 0,
                userAnswer: userAnswer ?? null,
                cpuAnswer: cpuAnswer ?? null,
                winner: winner ?? "none",
                createdAt,
            });
            console.log("✅ Round saved:", roundRef.id);
            res.status(200).json({
                message: "Round committed ✅",
                roundId: roundRef.id,
            });
        }
        catch (err) {
            console.error("🔥 commitRound Error:", err.message);
            res.status(500).json({
                error: err.message,
                stack: err.stack,
            });
        }
    });
});
