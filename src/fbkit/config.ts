<<<<<<< HEAD
export const firebaseConfig = {
  apiKey: "demo",         // エミュ用途なのでダミーでOK（本番時は本物を入れる）
  projectId: "demo-gachaben",
  appId: "demo",
};

export const USE_EMU = import.meta.env.VITE_USE_EMU === "true";

export const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT ?? 9099);
export const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8089);
export const STORAGE_PORT = Number(import.meta.env.VITE_STORAGE_PORT ?? 9199);

// localhost 判定を広めに（0.0.0.0 / ::1 もOK）
export const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(window.location.hostname);
=======
// src/fbkit/config.ts
const USE_EMU = (import.meta.env.VITE_USE_EMU ?? "false") === "true";

export const firebaseConfig = USE_EMU
  ? {
      apiKey: "fake-api-key",   // ← ここ大事
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

export const isBrowser = typeof window !== "undefined";
export const isLocalhost = isBrowser && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
export { USE_EMU };
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
