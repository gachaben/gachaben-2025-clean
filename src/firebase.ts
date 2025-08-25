// src/firebase.ts  ← ここが @/firebase の入口
export * from "./fbkit";      // db, auth, storage, ensureSignedIn などを再輸出（★dbが必ず出ます）
import * as fb from "./fbkit";
export default fb;            // default import 互換
