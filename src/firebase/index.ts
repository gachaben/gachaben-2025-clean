// ------------------------------------------------------
// 🌈 src/firebase/index.ts（エミュ対応＋本番対応）
// ------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// ------------------------------------------------------
// 🧩 環境設定
// ------------------------------------------------------
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8088);

const firebaseConfig = USE_EMU
  ? {
      apiKey: "fake-api-key", // ← Emulator用
      projectId: "demo-gachaben",
      appId: "demo-app",
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

// ------------------------------------------------------
// 🚀 Firebase 初期化
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);

// Firestore と Auth のインスタンスを作成
const db = getFirestore(app);
const auth = getAuth(app);

// ------------------------------------------------------
// 🧪 Emulator接続（開発環境のみ）
// ------------------------------------------------------
if (USE_EMU) {
  try {
    connectFirestoreEmulator(db, "127.0.0.1", FS_PORT);
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    console.log("🔥 Firebase Emulator connected");
  } catch (e) {
    console.warn("⚠️ Emulator connection skipped:", e);
  }
}

// ------------------------------------------------------
// ✅ Export
// ------------------------------------------------------
export { app, db, auth };
