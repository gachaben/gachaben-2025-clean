// @KEEP 理由: 柱（❤/ガチャ/ミッション/ランキング/問題履歴）に一致
// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,   // ★ 昔もあった export
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  initializeFirestore,
  connectFirestoreEmulator,
  setLogLevel,
  setDoc, doc, serverTimestamp, updateDoc, collection, getDocs,
} from "firebase/firestore";

// ▶ プロジェクトID
const PROD_PROJECT_ID = "";
const EMU_PROJECT_ID  = "demo-gachaben";

const isLocal =
  (typeof location !== "undefined" &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")) ||
  import.meta?.env?.VITE_USE_EMU === "true";

const PROJECT_ID = isLocal
  ? EMU_PROJECT_ID
  : (import.meta.env.VITE_FIREBASE_PROJECT_ID || PROD_PROJECT_ID);

const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT || 9099);
const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT || 8080);

const firebaseConfig = {
  apiKey: "demo",
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Safari 安定化
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// 便利 re-export
export { setDoc, doc, serverTimestamp, updateDoc, collection, getDocs };

// Auth
export const auth = getAuth(app);
export {
  signInAnonymously,              // ★ これをちゃんと export
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

// 匿名サインイン（未ログイン時のみ）
export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

// Emulator 接続
if (isLocal) {
  connectAuthEmulator(auth, `http://127.0.0.1:${AUTH_PORT}/`, { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  setLogLevel("error"); // or "silent"
  console.log(`[EMU] connected → Auth:${AUTH_PORT} / Firestore:${FIRESTORE_PORT}`);
  console.log("[EMU] projectId =", app.options.projectId);
}

export { app };
