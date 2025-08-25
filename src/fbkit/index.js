// src/fbkit/index.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore, connectFirestoreEmulator, initializeFirestore,
  persistentLocalCache, persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// ---- ENV 読み込み ----
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8088);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-gachaben",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
};

const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

let _app, _db, _auth, _storage;

export function getFirebaseApp() {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirestoreDb() {
  if (!_db) {
    _db = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    });
    if (isLocalhost && USE_EMU) {
      console.log("[FBKIT] Firestore -> emulator", {
        host: "localhost",
        port: FS_PORT,
        USE_EMU,
        projectId: firebaseConfig.projectId,
      });
      connectFirestoreEmulator(_db, "localhost", FS_PORT);
    }
  }
  return _db;
}

export function getFirebaseAuth() {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    if (isLocalhost && USE_EMU) connectAuthEmulator(_auth, "http://localhost:9099", { disableWarnings: true });
  }
  return _auth;
}

export function getFirebaseStorage() {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
    if (isLocalhost && USE_EMU) connectStorageEmulator(_storage, "localhost", 9199);
  }
  return _storage;
}
