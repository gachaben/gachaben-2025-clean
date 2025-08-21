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
import { firebaseConfig, isLocalhost } from "./config";

// ---- Singleton holders ----
let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getFirestoreDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    try {
      // 初回はキャッシュ付きで初期化
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch (e) {
      // 既に他所で初期化されていた場合は既存インスタンスを返す
      _db = getFirestore(app);
    }
    if (isLocalhost) {
      connectFirestoreEmulator(_db, "localhost", 8080);
    }
  }
  return _db;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
    if (isLocalhost) {
      connectAuthEmulator(_auth, "http://localhost:9099", {
        disableWarnings: true,
      });
    }
  }
  return _auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    const app = getFirebaseApp();
    _storage = getStorage(app);
    if (isLocalhost) {
      connectStorageEmulator(_storage, "localhost", 9199);
    }
  }
  return _storage;
}
