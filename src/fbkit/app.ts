// src/fbkit/app.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";
import { firebaseConfig, AUTH_PORT, FIRESTORE_PORT, USE_EMU } from "./config";

let _app: FirebaseApp | undefined;
let _db: Firestore | undefined;
let _auth: Auth | undefined;
let _storage: FirebaseStorage | undefined;

export function getFirebaseApp() {
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app!;
}
export function getFirestoreDb() { if (!_db) _db = getFirestore(getFirebaseApp()); return _db!; }
export function getAuthInstance() { if (!_auth) _auth = getAuth(getFirebaseApp()); return _auth!; }
export function getStorageInstance() { if (!_storage) _storage = getStorage(getFirebaseApp()); return _storage!; }

export const app = getFirebaseApp();
export const db = getFirestoreDb();
export const auth = getAuthInstance();
export const storage = getStorageInstance();

// Emulator�E�EMR多重対策！E
const useEmu = USE_EMU;
if (useEmu && !(globalThis as any).__EMU_CONNECTED__) {
  const HOST = "127.0.0.1";
  try { connectAuthEmulator(auth, `http://${HOST}:${AUTH_PORT}`, { disableWarnings: true }); } catch {}
  try { connectFirestoreEmulator(db, HOST, FIRESTORE_PORT); } catch {}
  try { connectStorageEmulator(storage, HOST, 9199); } catch {}
  (globalThis as any).__EMU_CONNECTED__ = true;
}
