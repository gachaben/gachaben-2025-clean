// ------------------------------------------------------
// functions/src/index.ts（最終安定版 / DebugPage完全連動）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express, { Request, Response } from "express";
import cors from "cors";

// ✅ Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Admin initialized (index.ts)");
}

// ✅ Expressアプリ設定
const app = express();

// ✅ CORS設定（ViteのローカルURLを許可）
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

// --- createBattle ---
app.post("/createBattle", async (req: Request, res: Response): Promise<void> => {
  console.log("[createBattle] called");
  const battleId = "debug-" + Date.now();
  res.status(200).json({ ok: true, msg: "createBattle OK", battleId });
});

// --- commitRound ---
app.post("/commitRound", async (req: Request, res: Response): Promise<void> => {
  console.log("[commitRound] called");
  const { battleId, round } = req.body || {};
  res.status(200).json({ ok: true, msg: "commitRound OK", received: { battleId, round } });
});

// --- finishBattleFn ---
app.post("/finishBattleFn", async (req: Request, res: Response): Promise<void> => {
  console.log("[finishBattleFn] called");
  const { battleId } = req.body || {};
  res.status(200).json({ ok: true, msg: "finishBattleFn OK", received: { battleId } });
});

// --- これが超重要！！ ---
// export のみでOK（importを重複しない！）
exports.api = functions.https.onRequest(app);
module.exports = { api: exports.api };
