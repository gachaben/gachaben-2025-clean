// ------------------------------------------------------
// src/fbkit/index.ts（完全版・2025対応）
// Firebase 統合エクスポート（app / auth / db / storage）
// ------------------------------------------------------

import { app } from "./app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { ensureSignedIn } from "./auth";

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app, ensureSignedIn };

console.log("[FBKIT] index.ts initialized (auth/db/storage ready)");
