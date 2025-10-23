// ------------------------------------------------------
// functions/src/index.ts（完全統一版 / commitRound接続修正版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Request, Response } from "express";
import { createBattle } from "./createBattle";
import { commitRound } from "./commitRound";
import { finishBattle } from "./finishBattle";

if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Firebase Admin initialized");
}

// ✅ CORS設定
function handleCORS(req: Request, res: Response): boolean {
  const allowedOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];
  const origin = req.headers.origin || "http://127.0.0.1:5173";
  res.setHeader(
    "Access-Control-Allow-Origin",
    allowedOrigins.includes(origin) ? origin : "*"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

// ✅ createBattleFn
export const createBattleFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  return createBattle(req, res);
});

// ✅ commitRoundFn（← ここが最新 commitRound を呼ぶ）
export const commitRoundFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  return commitRound(req, res);
});

// ✅ finishBattleFn
export const finishBattleFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  return finishBattle(req, res);
});

// ✅ ping
export const pingFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  res.status(200).json({ ok: true, msg: "pong", time: Date.now() });
});
