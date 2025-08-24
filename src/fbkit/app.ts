// src/fbkit/app.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";
import { firebaseConfig, isLocalhost, FIRESTORE_PORT } from "./config";

// ---- Singleton holders ----
let _app: ReturnType<typeof initializeApp> | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

export function getFirebaseApp() {
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getFirestoreDb(): Firestore {
  if (!_db) {
    const app = getFirebaseApp();
    try {
      _db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
        ignoreUndefinedProperties: true,
        experimentalAutoDetectLongPolling: true,
      });
    } catch {
      _db = getFirestore(app);
    }
    if (isLocalhost) {
      connectFirestoreEmulator(_db, "localhost", FIRESTORE_PORT);
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
