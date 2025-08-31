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
