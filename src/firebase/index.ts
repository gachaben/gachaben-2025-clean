// ------------------------------------------------------
// 🌈 src/firebase/index.ts（v2.0 エミュ対応＋本番対応＋匿名サインイン）
// ------------------------------------------------------
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInAnonymously,
  onAuthStateChanged,
} from "firebase/auth";

// ------------------------------------------------------
// 🧩 環境設定
// ------------------------------------------------------
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089); // ← 実際のポートに統一

// ✅ Emulator時も projectId は .env.local から取得する
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "fake-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gachaben-2025-clean",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fake-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app",
};

// ------------------------------------------------------
// 🚀 Firebase 初期化
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ------------------------------------------------------
// 🧪 Emulator接続（開発環境のみ）
// ------------------------------------------------------
if (USE_EMU) {
  try {
    connectFirestoreEmulator(db, "127.0.0.1", FS_PORT);
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    console.log("🔥 Firebase Emulator connected (project:", firebaseConfig.projectId, ")");
  } catch (e) {
    console.warn("⚠️ Emulator connection skipped:", e);
  }
}

// ------------------------------------------------------
// 👤 匿名サインイン（Emulator用）
// ------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth)
      .then(() => console.log("✅ Anonymous sign-in success"))
      .catch((err) => console.warn("⚠️ Sign-in failed:", err));
  } else {
    console.log("👤 Signed in:", user.uid);
  }
});

// ------------------------------------------------------
// ✅ Export
// ------------------------------------------------------
export { app, db, auth };
