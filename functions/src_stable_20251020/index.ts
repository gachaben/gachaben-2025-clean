// ------------------------------------------------------
// functions/src/index.ts（2025安定版）
// ------------------------------------------------------
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { createBattle } from "./createBattle";
import { commitRound } from "./commitRound";
import { finishBattle } from "./finishBattle";

// ✅ Firebase Admin SDK 初期化
if (!admin.apps.length) {
  admin.initializeApp();
  console.log("✅ Firebase Admin initialized");
}
import { allowCORS } from "../src/corsHelper";




export const createBattleFn = functions.https.onRequest(allowCORS(createBattle));
export const commitRoundFn = functions.https.onRequest(allowCORS(commitRound));
export const finishBattleFn = functions.https.onRequest(allowCORS(finishBattle));

// ✅ 動作確認用 ping 関数
export const pingFn = functions.https.onRequest((req, res) => {
  res.status(200).json({ ok: true, when: Date.now() });
});

console.log("[FUNCTIONS] index.ts initialized (v1 / admin + CORS)");
