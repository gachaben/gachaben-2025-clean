// src/fbkit/app.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  initializeFirestore,
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

// ---- Firebase App ----
export function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app!;
}

// ---- Firestore ----
export function getFirestoreDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    _db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      ignoreUndefinedProperties: true,
    });
    if (USE_EMU && isLocalhost) {
      connectFirestoreEmulator(_db, "127.0.0.1", FIRESTORE_PORT);
    }
  }
  return _db!;
}

// ---- Auth ----
export function getFirebaseAuth(): Auth {
  if (!_auth) {
    const app = getFirebaseApp();
    _auth = getAuth(app);
    if (USE_EMU && isLocalhost) {
      connectAuthEmulator(_auth, `http://127.0.0.1:${AUTH_PORT}`, {
        disableWarnings: true,
      });
    }
  }
  return _auth!;
}

// ---- Storage ----
export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    const app = getFirebaseApp();
    _storage = getStorage(app);
    if (USE_EMU && isLocalhost) {
      connectStorageEmulator(_storage, "127.0.0.1", STORAGE_PORT);
    }
  }
  return _storage!;
}
