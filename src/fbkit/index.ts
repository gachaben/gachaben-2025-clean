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

// src/fbkit/index.ts
export {
  getFirebaseApp,
  getFirestoreDb,
  getFirebaseAuth,
  getFirebaseStorage,
} from "./app";

export * from "./config"; // firebaseConfig, isLocalhost などを使う場合のみ