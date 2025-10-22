// ------------------------------------------------------
// src/lib/battleAPI.ts
// Firebase Functions API呼び出しユーティリティ
// （Emulator／Production 両対応）
// ------------------------------------------------------

import { app } from "@/fbkit/app";
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from "firebase/functions";

const functions = getFunctions(app);

// ✅ Emulator環境用接続
if (import.meta.env.VITE_USE_EMU === "true") {
  connectFunctionsEmulator(functions, "localhost", 5002);
  console.log("🔥 Functions Emulator connected (localhost:5002)");
}

// ------------------------------------------------------
// createBattle
// ------------------------------------------------------
export async function createBattleAPI() {
  try {
    const fn = httpsCallable(functions, "createBattleFn");
    const res = await fn({});
    console.log("✅ createBattle:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ createBattle error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// commitRound
// ------------------------------------------------------
export async function commitRoundAPI(battleId: string) {
  try {
    const fn = httpsCallable(functions, "commitRoundFn");
    const res = await fn({ battleId });
    console.log("✅ commitRound:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ commitRound error:", error);
    throw error;
  }
}

// ------------------------------------------------------
// finishBattle
// ------------------------------------------------------
export async function finishBattleAPI(battleId: string) {
  try {
    const fn = httpsCallable(functions, "finishBattleFn");
    const res = await fn({ battleId });
    console.log("✅ finishBattle:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ finishBattle error:", error);
    throw error;
  }
}
