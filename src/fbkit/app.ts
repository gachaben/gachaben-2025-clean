// src/fbkit/app.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
<<<<<<< HEAD
=======
  getFirestore,
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
<<<<<<< HEAD
import {
  getAuth,
  connectAuthEmulator,
  type Auth,
} from "firebase/auth";
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from "firebase/storage";
=======
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig, isLocalhost, USE_EMU } from "./config";
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

import {
  firebaseConfig,
  USE_EMU,
  AUTH_PORT,
  FIRESTORE_PORT,
  STORAGE_PORT,
  isLocalhost,
} from "./config";

// ---- シングルトン保持 ----
let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

<<<<<<< HEAD
// ---- Firebase App ----
=======
// 2重初期化防止フラグ（HMR対応）
declare global {
  interface Window {
    __GBEN_FS_INIT__?: boolean;
  }
}

>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app!;
}

// ---- Firestore ----
export function getFirestoreDb(): Firestore {
<<<<<<< HEAD
  if (!_db) {
    const app = getFirebaseApp();
    _db = initializeFirestore(app, {
=======
  if (_db) return _db;
  const app = getFirebaseApp();

  if (!window.__GBEN_FS_INIT__) {
    const db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      ignoreUndefinedProperties: true,
    });
<<<<<<< HEAD
    if (USE_EMU && isLocalhost) {
      connectFirestoreEmulator(_db, "127.0.0.1", FIRESTORE_PORT);
    }
=======

    if (isLocalhost && USE_EMU) {
      const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT || 8089);
      connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
      console.log(`[FBKIT] Firestore -> emulator (127.0.0.1:${FIRESTORE_PORT})`);
    }

    _db = db;
    window.__GBEN_FS_INIT__ = true;
  } else {
    _db = getFirestore(app);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  }

  return _db;
}

// ---- Auth ----
export function getFirebaseAuth(): Auth {
<<<<<<< HEAD
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
    if (USE_EMU && isLocalhost) {
      connectAuthEmulator(_auth, `http://127.0.0.1:${AUTH_PORT}`, {
        disableWarnings: true,
      });
=======
  if (_auth) return _auth;
  const a = getAuth(getFirebaseApp());
  if (isLocalhost && USE_EMU) {
    try {
      const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT || 9099);
      connectAuthEmulator(a, `http://127.0.0.1:${AUTH_PORT}`, { disableWarnings: true });
      console.log(`[FBKIT] Auth -> emulator (127.0.0.1:${AUTH_PORT})`);
    } catch (e) {
      console.error("Auth emulator connection failed", e);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
    }
  }
  return _auth!;
}

// ---- Storage ----
export function getFirebaseStorage(): FirebaseStorage {
<<<<<<< HEAD
  if (!_storage) {
    const app = getFirebaseApp();
    _storage = getStorage(app);
    if (USE_EMU && isLocalhost) {
      connectStorageEmulator(_storage, "127.0.0.1", STORAGE_PORT);
    }
=======
  if (_storage) return _storage;
  const s = getStorage(getFirebaseApp());
  if (isLocalhost && USE_EMU) {
    const STORAGE_PORT = Number(import.meta.env.VITE_STORAGE_PORT || 9199);
    connectStorageEmulator(s, "127.0.0.1", STORAGE_PORT);
    console.log(`[FBKIT] Storage -> emulator (localhost:${STORAGE_PORT})`);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  }
  return _storage!;
}
