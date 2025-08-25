// TypeScriptならこのまま、JSなら型を削ってOK
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getFirestore, connectFirestoreEmulator, initializeFirestore,
  persistentLocalCache, persistentMultipleTabManager, type Firestore,
} from "firebase/firestore";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = { apiKey: "demo", projectId: "demo-gachaben", appId: "demo" };

const isBrowser = typeof window !== "undefined";
const isLocalhost = isBrowser && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const USE_EMU = import.meta.env.VITE_USE_EMU === "true";

let _app: FirebaseApp;
let _db: Firestore;
let _auth: Auth;
let _storage: FirebaseStorage;

export function getFirebaseApp(): FirebaseApp {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirestoreDb(): Firestore {
  if (!_db) {
    _db = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      ignoreUndefinedProperties: true,
    });
    if (isLocalhost && USE_EMU) connectFirestoreEmulator(_db, "localhost", Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8088));
  }
  return _db;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    if (isLocalhost && USE_EMU) connectAuthEmulator(_auth, "http://localhost:9099", { disableWarnings: true });
  }
  return _auth;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
    if (isLocalhost && USE_EMU) connectStorageEmulator(_storage, "localhost", 9199);
  }
  return _storage;
}
