// ------------------------------------------------------
// src/fbkit/index.ts（完全版）
// Firebase 統合エクスポート
// ------------------------------------------------------

import {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";
import { firebaseConfig } from "./config";
import { ensureSignedIn } from "./auth";

// ---- 関数群の再エクスポート ----
export {
  firebaseConfig,
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
  ensureSignedIn,
};

// ---- シングルトン ----
export const db = getFirestoreDb();
export const auth = getFirebaseAuth();
export const storage = getFirebaseStorage();

console.log("[FBKIT] index.ts initialized (db/auth/storage ready)");
