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
// functions/src/createBattle.ts（完全安定版 / Timestamp修正）
// ------------------------------------------------------
const admin = __importStar(require("firebase-admin"));
// ✅ Firebase Admin 初期化
if (!admin.apps.length) {
    admin.initializeApp();
    console.log("✅ Admin initialized (createBattle)");
}
const db = admin.firestore();
// ✅ Timestamp を確実に取得
const Timestamp = admin.firestore?.Timestamp || {
    now: () => new Date(),
};
const createBattle = async (req, res) => {
    try {
        const { uid } = req.body;
        if (!uid)
            throw new Error("Missing uid");
        const ref = db.collection("battles").doc();
        const battleId = ref.id;
        // ✅ now() が存在しない場合にも fallback する
        const now = typeof Timestamp.now === "function" ? Timestamp.now() : new Date();
        await ref.set({
            battleId,
            uid,
            status: "waiting",
            createdAt: now,
            updatedAt: now,
            lastCommit: now,
        });
        res.status(200).json({
            ok: true,
            msg: "createBattle OK",
            battleId,
        });
    }
    catch (err) {
        console.error("[createBattle Error]", err);
        res.status(500).json({
            ok: false,
            msg: "Firestore create failed",
            error: err instanceof Error ? err.message : String(err),
        });
    }
};
exports.createBattle = createBattle;
