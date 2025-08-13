// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  initializeFirestore, connectFirestoreEmulator, setLogLevel,
} from "firebase/firestore";
import {
  getAuth, connectAuthEmulator, onAuthStateChanged, signInAnonymously,
} from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const USE_EMU = (import.meta.env.VITE_USE_FIREBASE_EMULATOR ?? "false") === "true";

// ✅ エミュ用はダミー値でOK。本番は .env の値を使う
const firebaseConfig = USE_EMU
  ? {
      apiKey: "fake-api-key",        // ← 本番に飛んだら絶対失敗する値
      authDomain: "localhost",
      projectId: "demo-gachaben",
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

// 重複初期化防止
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore は long-polling で安定化
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const auth = getAuth(app);
export const functions = getFunctions(app);

// 🔥 まず最初にエミュへ接続（ここが超重要）
if (USE_EMU) {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFunctionsEmulator(functions, "localhost", 5001);
  setLogLevel("debug");
  console.log("[EMU] connected → Auth:9099 / Firestore:8080 / Functions:5001");
}

// その後でリスナー/サインインを設定
onAuthStateChanged(auth, (u) => {
  if (!u) signInAnonymously(auth).catch((e) => console.error("[AUTH] anon error", e));
});

export { app };
