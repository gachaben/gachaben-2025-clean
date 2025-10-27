// ------------------------------------------------------
// src/fbkit/app.ts（最終安定版・二重初期化防止済み）
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

// ------------------------------------------------------
// ✅ Firebase 設定（Emulator / 本番両対応）
// ------------------------------------------------------
const firebaseConfig = USE_EMU
  ? {
      apiKey: "demo-key",
      authDomain: "localhost",
      projectId: "gachaben-2025", // ← “-clean”を削除して本番と統一
      storageBucket: "demo.appspot.com",
      messagingSenderId: "demo-sender",
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

// ------------------------------------------------------
// ✅ Firebase 初期化（重複防止）
// ------------------------------------------------------
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized (new instance)");
} else {
  app = getApp();
  console.log("♻️ Firebase reused existing instance");
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// ------------------------------------------------------
// ✅ Emulator 接続設定
// ------------------------------------------------------
if (USE_EMU) {
  try {
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
  } catch (err) {
    console.warn("⚠️ Emulator already connected (ignored):", err.message);
  }
}

// ------------------------------------------------------
// ✅ エクスポート
// ------------------------------------------------------
export { app, auth, db, storage, functions };

// ✅ ヘルパー関数
export const getFirebaseApp = () => app;
export const getFirebaseAuth = () => auth;
export const getFirestoreDb = () => db;
export const getFirebaseStorage = () => storage;
