// src/fbkit/index.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// === 既存の Firebase 設定をここに記載 ===
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "xxxxxx",
  appId: "x:xxxxxx:web:xxxxxx"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// === Auth ===
export function getFirebaseAuth() {
  const auth = getAuth(app);
  if (import.meta.env.DEV && !auth.emulatorConfig) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    console.log("[FBKIT] Auth -> emulator (127.0.0.1:9099)");
  }
  return auth;
}

// === Firestore ===
export function getFirestoreDb() {
  const db = getFirestore(app);
  if (import.meta.env.DEV) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080); // ✅ ここを8080に！
    console.log("[FBKIT] Firestore -> emulator (127.0.0.1:8080)");
  }
  return db;
}

// === Storage ===
export function getFirebaseStorage() {
  const storage = getStorage(app);
  if (import.meta.env.DEV) {
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    console.log("[FBKIT] Storage -> emulator (127.0.0.1:9199)");
  }
  return storage;
}

// === Export default ===
export { app };
