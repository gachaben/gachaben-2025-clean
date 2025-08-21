// src/fbkit/config.ts

// Vite(ブラウザ) では process が未定義なので必ず存在チェックする
const env = (key: string) => {
  const im = (import.meta as any)?.env;
  if (im && typeof im[key] === "string") return im[key] as string;
  if (typeof process !== "undefined" && (process as any)?.env?.[key]) {
    return (process as any).env[key] as string;
  }
  return "";
};

export const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID") || "demo-gachaben",
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET") || "demo-gachaben.appspot.com",
  appId: env("VITE_FIREBASE_APP_ID") || "",
};

export const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");
