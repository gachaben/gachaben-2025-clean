// ------------------------------------------------------
// src/fbkit/firestore.ts
// Firestore 初期化（Emulator対応・CORS防止版）
// ------------------------------------------------------
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { app } from "./app";

// ✅ 環境設定を読み込み
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089);

// ✅ Firestore 初期化
export const getFirestoreDb = () => {
  const db = getFirestore(app);

  // ✅ Emulator使用時のみ接続
  if (USE_EMU) {
    connectFirestoreEmulator(db, "127.0.0.1", FS_PORT);
    console.log(`[FBKIT] Firestore Emulator connected (port ${FS_PORT})`);
  }

  return db;
};
