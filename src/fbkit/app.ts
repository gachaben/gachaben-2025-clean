// ------------------------------------------------------
// src/fbkit/app.ts（最終安定版・接続安定版）
// Firebase Emulator / Production 両対応構成
// ------------------------------------------------------
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ✅ 環境変数（.env.local から）
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089);

// ✅ Firebase 設定（Emulator / 本番両対応）
const firebaseConfig = USE_EMU
  ? {
      apiKey: "demo-key",
      projectId: "gachaben-2025-clean", // ← emulator接続時でも本番と同じIDを使用（重要）
      appId: "demo-app",
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

// ✅ Firebase 初期化（重複防止）
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// ✅ Emulator 接続設定
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", FS_PORT);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5002);

  console.log("🔥 Firebase Emulator connected:", {
    firestore: `localhost:${FS_PORT}`,
    auth: "localhost:9099",
    storage: "localhost:9199",
    functions: "localhost:5002",
  });
}

// ✅ エクスポート
export { app, auth, db, storage, functions };

// ✅ ヘルパー関数
export function getFirebaseApp() {
  return app;
}
export function getFirebaseAuth() {
  return auth;
}
export function getFirestoreDb() {
  return db;
}
export function getFirebaseStorage() {
  return storage;
}
