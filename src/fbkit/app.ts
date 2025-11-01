// ------------------------------------------------------
// src/fbkit/app.ts（Firebase Emulator 対応版）
// ------------------------------------------------------
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
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

if (import.meta.env.VITE_USE_EMU === "true") {
  console.log("🧩 Connecting to Firebase Emulator...");
  connectAuthEmulator(auth, `http://${import.meta.env.VITE_EMU_HOST}:${import.meta.env.VITE_AUTH_PORT}`);
  connectFirestoreEmulator(db, import.meta.env.VITE_EMU_HOST, Number(import.meta.env.VITE_FIRESTORE_PORT));
  connectStorageEmulator(storage, import.meta.env.VITE_EMU_HOST, Number(import.meta.env.VITE_STORAGE_PORT));
  connectFunctionsEmulator(functions, import.meta.env.VITE_EMU_HOST, Number(import.meta.env.VITE_FUNCTIONS_PORT));
}

export { app, auth, db, storage, functions };
