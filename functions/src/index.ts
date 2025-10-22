// ------------------------------------------------------
// functions/src/index.ts（CORS完全動作版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Response } from "express";
import { createBattle } from "./createBattle";
import { commitRound } from "./commitRound";
import { finishBattle } from "./finishBattle";

if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Firebase Admin initialized");
}

// ✅ 共通CORS処理関数
function handleCORS(req: functions.https.Request, res: Response) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

// ✅ commitRoundFn
export const commitRoundFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  return commitRound(req, res);
});

// ✅ finishBattleFn
export const finishBattleFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  return finishBattle(req, res);
});

// ✅ pingFn
export const pingFn = functions.https.onRequest((req, res) => {
  if (handleCORS(req, res)) return;
  res.status(200).json({ ok: true, msg: "pong", time: Date.now() });
});

console.log("[FUNCTIONS] index.ts initialized (CORS OK)");
