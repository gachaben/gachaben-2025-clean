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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ------------------------------------------------------
// functions/src/index.ts（🔥 Firestore書き込み + Express対応 / 最終安定版）
// ------------------------------------------------------
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const firestore_1 = require("firebase-admin/firestore"); // ✅ 新仕様import
// ✅ Firebase Admin 初期化（Emulator対応）
if (!admin.apps.length) {
    admin.initializeApp({
        projectId: "gachaben-2025",
    });
    console.log("✅ Admin initialized (index.ts)");
}
// ✅ Firestore取得（admin.firestore() は使わない）
const db = (0, firestore_1.getFirestore)();
// ✅ Expressアプリ設定
const app = (0, express_1.default)();
// ✅ CORS設定（ViteローカルURL許可）
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// ✅ プリフライト対応
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
// ------------------------------------------------------
// 🟢 createBattle
// ------------------------------------------------------
app.post("/createBattle", async (req, res) => {
    console.log("[createBattle] called");
    try {
        const uid = (req.body && req.body.uid) || "debug-user";
        const cpuLevel = (req.body && req.body.cpuLevel) || "N";
        const battleId = "battle-" + Date.now();
        await db.collection("battles").doc(battleId).set({
            uid,
            cpuLevel,
            battleId,
            status: "in-progress",
            rounds: [],
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.Timestamp.now(),
        });
        console.log(`[createBattle] ✅ created: ${battleId}`);
        res.status(200).json({
            ok: true,
            msg: "createBattle success ✅ (Firestore書き込み済)",
            battleId,
        });
    }
    catch (err) {
        console.error("[createBattle] Error:", err);
        res.status(500).json({
            ok: false,
            msg: "createBattle Error",
            error: err instanceof Error ? err.message : String(err),
        });
    }
});
// ------------------------------------------------------
// 🟢 commitRound
// ------------------------------------------------------
app.post("/commitRound", async (req, res) => {
    console.log("[commitRound] called");
    try {
        const { battleId, round } = req.body || {};
        if (!battleId)
            throw new Error("battleId が未指定です");
        await db.collection("battles").doc(battleId).update({
            rounds: firestore_1.FieldValue.arrayUnion(round || { result: "test" }),
            updatedAt: firestore_1.Timestamp.now(),
        });
        res.status(200).json({
            ok: true,
            msg: "commitRound OK ✅",
            battleId,
        });
    }
    catch (err) {
        console.error("[commitRound] Error:", err);
        res.status(500).json({
            ok: false,
            msg: "commitRound Error",
            error: err instanceof Error ? err.message : String(err),
        });
    }
});
// ------------------------------------------------------
// 🟢 finishBattleFn
// ------------------------------------------------------
app.post("/finishBattleFn", async (req, res) => {
    console.log("[finishBattleFn] called");
    try {
        const { battleId } = req.body || {};
        if (!battleId)
            throw new Error("battleId が未指定です");
        await db.collection("battles").doc(battleId).update({
            status: "finished",
            finishedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        res.status(200).json({
            ok: true,
            msg: "finishBattleFn OK ✅",
            battleId,
        });
    }
    catch (err) {
        console.error("[finishBattleFn] Error:", err);
        res.status(500).json({
            ok: false,
            msg: "finishBattleFn Error",
            error: err instanceof Error ? err.message : String(err),
        });
    }
});
// ------------------------------------------------------
// 🟢 pingFn（接続確認）
// ------------------------------------------------------
app.get("/pingFn", async (_req, res) => {
    console.log("[pingFn] pong 🏓");
    res.status(200).json({ ok: true, msg: "pong 🏓 from pingFn" });
});
// ------------------------------------------------------
// ✅ Firebase Functions へエクスポート
// ------------------------------------------------------
exports.api = functions.https.onRequest(app);
console.log("🚀 Express API registered (/api/*)");
//# sourceMappingURL=index.js.map