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
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const createBattle = async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid) {
            res.status(400).json({ ok: false, msg: "uid missing" });
            return;
        }
        // ✅ Timestampを確実に取得
        const battleRef = db.collection("battles").doc();
        const battleData = {
            battleId: battleRef.id,
            uid,
            createdAt: new Date(), // ← ← ← 一旦これでOK！（Timestamp.now()の代替）
            status: "waiting",
        };
        await battleRef.set(battleData);
        res.status(200).json({
            ok: true,
            msg: "createBattle OK",
            battleId: battleRef.id,
            time: Date.now(),
        });
    }
    catch (err) {
        console.error("[createBattleFn] Error:", err);
        res.status(500).json({
            ok: false,
            msg: "Internal Server Error",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
exports.createBattle = createBattle;
