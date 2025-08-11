import { initializeApp, getApps, getApp } from "firebase/app"; // ←ここが重要！
import { db } from "../firebase"; // or "./firebase"


// あなたの Firebase 設定をここに記入
const firebaseConfig = {
  apiKey: "AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.firebasestorage.app",
  messagingSenderId: "929513375207",
  appId: "1:929513375207:web:94167d7e05eff28b7f2942",
};

// すでに初期化されているかを確認してから初期化
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestoreのインスタンスを取得
