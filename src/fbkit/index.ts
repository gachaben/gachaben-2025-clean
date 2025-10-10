// src/fbkit/index.ts
// ------------------------------------------------------
// Firebase 統合エクスポート（v1.3.1 準拠）
// app.ts で定義された getFirebaseApp / getFirestoreDb 等を統合。
// どのページからでも import { db, auth, storage } from "@/fbkit" が可能。
// ------------------------------------------------------

import {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";
import { firebaseConfig } from "./config";

// ---- 関数群の再エクスポート ----
export {
  firebaseConfig,
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
};

// ---- シングルトンとして即時取得（他ページ互換）----
export const db = getFirestoreDb();
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();
export { ensureSignedIn } from "./auth";

console.log("[FBKIT] index.ts initialized (db/auth/storage ready)");
