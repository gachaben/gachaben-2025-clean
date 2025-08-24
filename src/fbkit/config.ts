// src/fbkit/config.ts
export const firebaseConfig = {
  apiKey: "demo",
  projectId: "demo-gachaben",
  appId: "demo",
};

const _useEmu = import.meta.env.VITE_USE_EMU === "true";

// .env の値があればそれを数値化、なければ 8080
export const FIRESTORE_PORT = import.meta.env.VITE_FIRESTORE_PORT
  ? Number(import.meta.env.VITE_FIRESTORE_PORT)
  : 8080;

// ブラウザ実行時のみエミュ接続する安全弁
export const isLocalhost = _useEmu && typeof window !== "undefined";
