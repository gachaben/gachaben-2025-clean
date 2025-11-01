import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ✅ .env 読み込み
const USE_EMU = import.meta.env.VITE_USE_EMU === "true";
const HOST = import.meta.env.VITE_EMU_HOST || "127.0.0.1";
const FS_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8090);
const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT ?? 9100);
const FUNCTIONS_PORT = Number(import.meta.env.VITE_FUNCTIONS_PORT ?? 5003);
const STORAGE_PORT = Number(import.meta.env.VITE_STORAGE_PORT ?? 9199);

// ✅ Firebase 設定
const firebaseConfig = USE_EMU
  ? {
      apiKey: "demo-key",
      authDomain: "localhost",
      projectId: "demo-project",
      storageBucket: "demo.appspot.com",
      messagingSenderId: "demo-sender",
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

// ✅ 初期化
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized (new instance)");
} else {
  app = getApp();
  console.log("♻️ Firebase reused existing instance");
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// ✅ Emulator接続
if (USE_EMU) {
  try {
    connectFirestoreEmulator(db, HOST, FS_PORT);
    connectAuthEmulator(auth, `http://${HOST}:${AUTH_PORT}`);
    connectStorageEmulator(storage, HOST, STORAGE_PORT);
    connectFunctionsEmulator(functions, HOST, FUNCTIONS_PORT);

    console.log("🔥 Firebase Emulator connected:", {
      firestore: `${HOST}:${FS_PORT}`,
      auth: `${HOST}:${AUTH_PORT}`,
      storage: `${HOST}:${STORAGE_PORT}`,
      functions: `${HOST}:${FUNCTIONS_PORT}`,
    });
  } catch (err) {
    console.warn("⚠️ Emulator already connected (ignored):", err.message);
  }
}

export { app, auth, db, storage, functions };
