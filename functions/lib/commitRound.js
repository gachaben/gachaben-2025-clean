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
// commitRound.ts（完全修正版 / CORS対応）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const cors_1 = __importDefault(require("cors"));
const firestore_1 = require("firebase-admin/firestore");
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true, methods: ["GET", "POST", "OPTIONS"] });
exports.commitRound = (0, https_1.onRequest)((req, res) => {
    corsHandler(req, res, async () => {
        try {
            if (req.method === "OPTIONS") {
                res.set("Access-Control-Allow-Origin", "*");
                res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.set("Access-Control-Allow-Headers", "Content-Type");
                return res.status(204).send("");
            }
            console.log("🎯 commitRound 呼び出し開始");
            const { battleId, roundData } = req.body || {};
            if (!battleId)
                throw new Error("battleId が未指定です");
            await db
                .collection("battles")
                .doc(battleId)
                .collection("rounds")
                .add({
                ...roundData,
                committedAt: firestore_1.Timestamp.now(),
            });
            res.set("Access-Control-Allow-Origin", "*");
            res.status(200).json({ message: "Round committed ✅" });
        }
        catch (err) {
            console.error("🔥 commitRound Error:", err);
            res.set("Access-Control-Allow-Origin", "*");
            res.status(500).json({ error: err.message, stack: err.stack });
        }
    });
});
