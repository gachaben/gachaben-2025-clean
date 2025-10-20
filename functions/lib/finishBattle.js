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
// functions/src/finishBattle.ts（2025安定版）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
// ✅ Firestore インスタンス
const db = admin.firestore();
const finishBattle = async (req, res) => {
    try {
        const { battleId } = req.body;
        if (!battleId)
            throw new Error("battleId が未指定です");
        await db.collection("battles").doc(battleId).update({
            result: "finished",
            finishedAt: new Date().toISOString(),
        });
        res.status(200).json({
            ok: true,
            msg: "Battle finished",
            battleId,
        });
    }
    catch (error) {
        console.error("🔥 finishBattle error:", error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
exports.finishBattle = finishBattle;
