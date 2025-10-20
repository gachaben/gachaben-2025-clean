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
// functions/src/createBattle.ts（Firestore Emulator接続版・型エラー完全回避版）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const firestore_1 = require("firebase-admin/firestore");
// ✅ 型の衝突を避けるため require() を使用
const cors = require("cors");
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: "gachaben-2025-clean", // ← 重要（必ず残す）
    });
}
const db = admin.firestore();
// ✅ CORS ハンドラー（localhost許可）
const corsHandler = cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});
// ✅ createBattle 関数
exports.createBattle = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const userId = "test-user"; // 仮のユーザーID
            const battleRef = db.collection("battles").doc();
            await battleRef.set({
                userId,
                opponentId: "cpu-normal",
                cpuLevel: "N",
                result: "pending",
                createdAt: firestore_1.Timestamp.now(),
            });
            res.status(200).json({
                ok: true,
                msg: "Battle created ✅",
                battleId: battleRef.id,
            });
        }
        catch (error) {
            res.status(500).json({
                error: error.message,
                stack: error.stack,
            });
        }
    });
});
