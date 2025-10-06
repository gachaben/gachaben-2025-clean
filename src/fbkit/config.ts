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
