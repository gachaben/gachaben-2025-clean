// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
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
const PROD_PROJECT_ID = ""; // 必要になったら設定
const EMU_PROJECT_ID  = "demo-gachaben";

const isLocal =
  (typeof location !== "undefined" &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")) ||
  import.meta?.env?.VITE_USE_EMU === "true";

const PROJECT_ID = isLocal
  ? EMU_PROJECT_ID
  : (import.meta.env.VITE_FIREBASE_PROJECT_ID || PROD_PROJECT_ID);

// ★ Firestoreエミュのポート（未設定なら 8080 を使う）
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

// 使いやすく re-export
export { setDoc, doc, serverTimestamp, updateDoc, collection, getDocs };

export const auth = getAuth(app);
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
};

// 🔐 どこからでも呼べる匿名サインイン（未ログイン時だけ実行）
export async function ensureSignedIn() {
  const a = auth;
  if (a.currentUser) return a.currentUser;
  try {
    const cred = await signInAnonymously(a);
    return cred.user;
  } catch (e) {
    console.error("ensureSignedIn failed:", e);
    throw e;
  }
}

if (isLocal) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  setLogLevel("debug");
  console.log("[EMU] connected → Auth:9099 / Firestore:", FIRESTORE_PORT);
  console.log("[EMU] projectId =", app.options.projectId);
}

export { app };
