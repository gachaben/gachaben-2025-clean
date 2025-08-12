// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth /*, connectAuthEmulator */ } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// ★ あなたのFirebase設定（そのままでOKならそのまま）
const firebaseConfig = {
  apiKey: "AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.firebasestorage.app",
  messagingSenderId: "929513375207",
  appId: "1:929513375207:web:94167d7e05eff28b7f2942",
};

// --- App はシングルトン ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- 各サービス取得 ---
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// --- 開発中だけエミュに接続（本番は何もしない） ---
if (import.meta.env.DEV) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
  // Functionsエミュを使うときだけ ↓ を有効化（5001で起動している前提）
  // try { connectFunctionsEmulator(functions, "localhost", 5001); } catch {}
  // Authエミュを使いたいときは 9099 を起動してから ↓ を有効化
  // try { connectAuthEmulator(auth, "http://127.0.0.1:9099"); } catch {}
}

export { app, db, auth, storage, functions };
