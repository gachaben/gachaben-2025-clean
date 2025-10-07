// src/fbkit/config.ts

// --- Emulator 使用判定 ---
export const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";

// --- Firebase 設定 ---
// ローカルエミュレータ使用時はダミーキーでOK
export const firebaseConfig = USE_EMU
  ? {
      apiKey: "demo",              // エミュ用途（実キー不要）
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

// --- ポート設定（エミュレータ用）---
export const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT ?? 9099);
export const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089);
export const STORAGE_PORT = Number(import.meta.env.VITE_STORAGE_PORT ?? 9199);

// --- localhost 判定 ---
export const isBrowser = typeof window !== "undefined";
export const isLocalhost =
  isBrowser &&
  ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(window.location.hostname);
