// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore, getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  // ← あなたの設定
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ---- ここがポイント：db は1回だけ宣言 ----
let dbRef = null;
try {
  // 初回だけ設定付きで初期化（既に開始済みなら throw）
  dbRef = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  });
} catch {
  // 既に開始済みなら既存を取得
  dbRef = getFirestore(app);
}
const db = dbRef;

const functions = getFunctions(app);
const auth = getAuth(app);

if (import.meta.env.DEV) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
  try { connectFunctionsEmulator(functions, "localhost", 5001); } catch {}
  signInAnonymously(auth).catch(console.error);
}

export { app, db, functions, auth };
