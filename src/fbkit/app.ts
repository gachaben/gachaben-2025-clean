// ------------------------------------------------------
// src/fbkit/app.ts（最終安定版）
// ------------------------------------------------------
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", FS_PORT);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectStorageEmulator(storage, "127.0.0.1", 9199);
  connectFunctionsEmulator(functions, "127.0.0.1", 5002); // ✅ ← これが重要
  console.log("🔥 Firebase Emulator connected:", {
    firestore: `localhost:${FS_PORT}`,
    auth: "localhost:9099",
    storage: "localhost:9199",
    functions: "localhost:5002",
  });
}

export { app, auth, db, storage, functions };
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
