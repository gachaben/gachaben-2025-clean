// ------------------------------------------------------
// functions/src/index.ts（🔥 Firestore書き込み + Express対応 / 最終安定版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore"; // ✅ 新仕様import

// ✅ Firebase Admin 初期化（Emulator対応）
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "gachaben-2025",
  });
  console.log("✅ Admin initialized (index.ts)");
}

// ✅ Firestore取得（admin.firestore() は使わない）
const db = getFirestore();

// ✅ Expressアプリ設定
const app = express();

// ✅ CORS設定（ViteローカルURL許可）
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ プリフライト対応
app.options("*", cors());
app.use(express.json());

// ------------------------------------------------------
// 🟢 createBattle
// ------------------------------------------------------
app.post("/createBattle", async (req: Request, res: Response): Promise<void> => {
  console.log("[createBattle] called");

  try {
    const uid = (req.body && (req.body as any).uid) || "debug-user";
    const cpuLevel = (req.body && (req.body as any).cpuLevel) || "N";
    const battleId = "battle-" + Date.now();

    await db.collection("battles").doc(battleId).set({
      uid,
      cpuLevel,
      battleId,
      status: "in-progress",
      rounds: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: Timestamp.now(),
    });

    console.log(`[createBattle] ✅ created: ${battleId}`);

    res.status(200).json({
      ok: true,
      msg: "createBattle success ✅ (Firestore書き込み済)",
      battleId,
    });
  } catch (err) {
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
app.post("/commitRound", async (req: Request, res: Response): Promise<void> => {
  console.log("[commitRound] called");

  try {
    const { battleId, round } = req.body || {};
    if (!battleId) throw new Error("battleId が未指定です");

    await db.collection("battles").doc(battleId).update({
      rounds: FieldValue.arrayUnion(round || { result: "test" }),
      updatedAt: Timestamp.now(),
    });

    res.status(200).json({
      ok: true,
      msg: "commitRound OK ✅",
      battleId,
    });
  } catch (err) {
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
app.post("/finishBattleFn", async (req: Request, res: Response): Promise<void> => {
  console.log("[finishBattleFn] called");

  try {
    const { battleId } = req.body || {};
    if (!battleId) throw new Error("battleId が未指定です");

    await db.collection("battles").doc(battleId).update({
      status: "finished",
      finishedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({
      ok: true,
      msg: "finishBattleFn OK ✅",
      battleId,
    });
  } catch (err) {
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
app.get("/pingFn", async (_req: Request, res: Response): Promise<void> => {
  console.log("[pingFn] pong 🏓");
  res.status(200).json({ ok: true, msg: "pong 🏓 from pingFn" });
});

// ------------------------------------------------------
// ✅ Firebase Functions へエクスポート
// ------------------------------------------------------
exports.api = functions.https.onRequest(app);
console.log("🚀 Express API registered (/api/*)");
