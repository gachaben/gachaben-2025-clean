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
// createBattle.ts（CORS + Emulator 完全安定版）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
if (!admin.apps.length) {
    admin.initializeApp();
    console.log("🔥 Firebase Admin initialized");
}
const db = admin.firestore();
exports.createBattle = (0, https_1.onRequest)({ region: "us-central1" }, async (req, res) => {
    // ✅ 明示的 CORS 設定
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    // ✅ OPTIONS 対応（プリフライト処理）
    if (req.method === "OPTIONS") {
        console.log("🟢 Preflight OK");
        res.status(204).send("");
        return;
    }
    try {
        console.log("🧩 createBattle 呼び出し開始");
        console.log("📦 req.body:", req.body);
        const uid = req.body?.uid || "demo-user-001";
        const { opponentId = "cpu-normal", cpuLevel = "N", startPw = 1000 } = req.body || {};
        // ✅ Firestore 書き込み
        const battleRef = await db.collection("battles").add({
            userId: uid,
            opponentId,
            cpuLevel,
            startPw,
            createdAt: firestore_1.Timestamp.now(),
        });
        console.log("✅ Battle created:", battleRef.id);
        // ✅ レスポンスにも CORS を明示
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json({
            battleId: battleRef.id,
            message: "Battle created ✅",
        });
    }
    catch (err) {
        console.error("🔥 createBattle Error:", err);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(500).json({ error: err.message });
    }
});
