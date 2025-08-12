// src/firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously, // 開発中の簡易ログイン
  // connectAuthEmulator,  // 使いたくなったら有効化
} from "firebase/auth";

// ★ あなたのFirebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.firebasestorage.app",
  messagingSenderId: "929513375207",
  appId: "1:929513375207:web:94167d7e05eff28b7f2942",
};

// --- Appはシングルトン ---
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// --- Firestore/ Auth ---
export const db = getFirestore(app);
export const auth = getAuth(app);

// --- 開発中は自動でエミュに接続 ---
if (import.meta.env.DEV) {
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
  // try { connectAuthEmulator(auth, "http://localhost:9099"); } catch {}
  // 匿名ログイン（ルールが auth 必須でも動くように）
  signInAnonymously(auth).catch(console.error);
}
