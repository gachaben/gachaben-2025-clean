// src/fbkit/app.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig, isLocalhost, USE_EMU } from "./config";

let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

// 2重初期化防止フラグ（HMR対応）
declare global {
  interface Window {
    __GBEN_FS_INIT__?: boolean;
  }
}

export function getFirebaseApp(): FirebaseApp {
  return (_app ??= (getApps().length ? getApp() : initializeApp(firebaseConfig)));
}

export function getFirestoreDb(): Firestore {
  if (_db) return _db;
  const app = getFirebaseApp();

  if (!window.__GBEN_FS_INIT__) {
    const db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

    if (isLocalhost && USE_EMU) {
      const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT || 8089);
      connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
      console.log(`[FBKIT] Firestore -> emulator (127.0.0.1:${FIRESTORE_PORT})`);
    }

    _db = db;
    window.__GBEN_FS_INIT__ = true;
  } else {
    _db = getFirestore(app);
  }

  return _db;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  const a = getAuth(getFirebaseApp());
  if (isLocalhost && USE_EMU) {
    try {
      const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT || 9099);
      connectAuthEmulator(a, `http://127.0.0.1:${AUTH_PORT}`, { disableWarnings: true });
      console.log(`[FBKIT] Auth -> emulator (127.0.0.1:${AUTH_PORT})`);
    } catch (e) {
      console.error("Auth emulator connection failed", e);
    }
  }
  _auth = a;
  return _auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  const s = getStorage(getFirebaseApp());
  if (isLocalhost && USE_EMU) {
    const STORAGE_PORT = Number(import.meta.env.VITE_STORAGE_PORT || 9199);
    connectStorageEmulator(s, "127.0.0.1", STORAGE_PORT);
    console.log(`[FBKIT] Storage -> emulator (localhost:${STORAGE_PORT})`);
  }
  _storage = s;
  return _storage;
}
