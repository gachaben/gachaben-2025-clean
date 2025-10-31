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
// functions/src/index.ts（最終安定版 / DebugPage完全連動）
// ------------------------------------------------------
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// ✅ Admin 初期化
if (!admin.apps.length) {
    admin.initializeApp();
    console.log("✅ Admin initialized (index.ts)");
}
// ✅ Expressアプリ設定
const app = (0, express_1.default)();
// ✅ CORS設定（ViteのローカルURLを許可）
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// ✅ プリフライト対応
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
// --- createBattle ---
app.post("/createBattle", async (req, res) => {
    console.log("[createBattle] called");
    const battleId = "debug-" + Date.now();
    res.status(200).json({ ok: true, msg: "createBattle OK", battleId });
});
// --- commitRound ---
app.post("/commitRound", async (req, res) => {
    console.log("[commitRound] called");
    const { battleId, round } = req.body || {};
    res.status(200).json({ ok: true, msg: "commitRound OK", received: { battleId, round } });
});
// --- finishBattleFn ---
app.post("/finishBattleFn", async (req, res) => {
    console.log("[finishBattleFn] called");
    const { battleId } = req.body || {};
    res.status(200).json({ ok: true, msg: "finishBattleFn OK", received: { battleId } });
});
// --- これが超重要！！ ---
// export のみでOK（importを重複しない！）
exports.api = functions.https.onRequest(app);
module.exports = { api: exports.api };
//# sourceMappingURL=index.js.map