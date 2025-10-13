// ------------------------------------------------------
// src/fbkit/app.ts（完全版）
// Firebase初期化＋Emulator接続＋export統一
// ------------------------------------------------------
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
// ✅ Firestoreのデフォルトポートを 8089 に修正
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089);

const firebaseConfig = USE_EMU
  ? {
      apiKey: "demo-key",
      projectId: "demo-gachaben",
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

// ✅ 既に初期化済みなら再利用
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Emulator接続（ローカル動作用）
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", 8089);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  console.log("🔥 Firebase Emulator connected:", {
    firestore: `localhost:${FS_PORT}`,
    auth: "localhost:9099",
    storage: "localhost:9199",
  });
}

// ------------------------------------------------------
// 🧩 共通export
// ------------------------------------------------------
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

export { app, auth, db, storage };
