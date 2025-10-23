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
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
// ✅ Timestamp 安全取得
const Timestamp = admin.firestore?.Timestamp || { now: () => new Date() };
const finishBattle = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).end();
        return;
    }
    try {
        const { battleId } = req.body;
        if (!battleId)
            throw new Error("Missing battleId");
        const ref = db.collection("battles").doc(battleId);
        const now = typeof Timestamp.now === "function" ? Timestamp.now() : new Date();
        await ref.update({
            status: "finished",
            updatedAt: now,
        });
        res.status(200).json({
            ok: true,
            msg: "Firestore finish success",
            battleId,
        });
    }
    catch (err) {
        console.error("[finishBattle Error]", err);
        res.status(500).json({
            ok: false,
            msg: "Firestore update failed",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
exports.finishBattle = finishBattle;
