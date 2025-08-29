// src/fbkit/app.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getAuth, type Auth, connectAuthEmulator } from "firebase/auth";
import { getStorage, type FirebaseStorage, connectStorageEmulator } from "firebase/storage";
import { firebaseConfig, isLocalhost } from "./config";

let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

// 2重初期化防止フラグ（HMR対応）
declare global { interface Window { __GBEN_FS_INIT__?: boolean } }

export function getFirebaseApp(): FirebaseApp {
  return (_app ??= (getApps().length ? getApp() : initializeApp(firebaseConfig)));
}

export function getFirestoreDb(): Firestore {
  if (_db) return _db;
  const app = getFirebaseApp();

  if (!window.__GBEN_FS_INIT__) {
    _db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    window.__GBEN_FS_INIT__ = true;
  } else {
    _db = getFirestore(app);
  }
  return _db!;
}

export function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  const a = getAuth(getFirebaseApp());
  if (isLocalhost) {
    try { connectAuthEmulator(a, "http://localhost:9099"); } catch {}
  }
  _auth = a;
  return _auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (_storage) return _storage;
  const s = getStorage(getFirebaseApp());
  if (isLocalhost) {
    try { connectStorageEmulator(s, "localhost", 9199); } catch {}
  }
  _storage = s;
  return _storage;
}
