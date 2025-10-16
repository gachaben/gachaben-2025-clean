// ------------------------------------------------------
// ⚙️ src/firebase.js（ローカルエミュ完全対応版）
// ------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// --- Firebase Config（ダミー）---
const firebaseConfig = {
  apiKey: "demo",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
};

// --- 初期化 ---
const app = initializeApp(firebaseConfig);

// --- 各サービス取得 ---
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// --- ローカルエミュ接続 ---
if (window.location.hostname === "localhost") {
  console.log("🔥 Firebase connected to LOCAL emulator");

  // ✅ Firestore エミュ接続（ポート9150）
  connectFirestoreEmulator(db, "localhost", 9150);

  // ✅ Auth エミュ接続（強制ローカル化）
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

  // ✅ Storage エミュ接続
  connectStorageEmulator(storage, "localhost", 9199);

  // ✅ ローカルでもログインを永続化
  setPersistence(auth, browserLocalPersistence)
    .then(() => signInAnonymously(auth))
    .then(() => console.log("✅ 匿名ログイン成功（local emulator）"))
    .catch((err) => console.error("匿名ログイン失敗", err));
}

export default app;
