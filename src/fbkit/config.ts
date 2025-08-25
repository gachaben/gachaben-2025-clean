// src/fbkit/config.ts
export const firebaseConfig = {
  apiKey: "demo",
  projectId: "demo-gachaben",
  appId: "demo",
};

export const USE_EMU = import.meta.env.VITE_USE_EMU === "true";
export const AUTH_PORT = Number(import.meta.env.VITE_AUTH_PORT ?? 9099);
export const FIRESTORE_PORT = Number(import.meta.env.VITE_FIRESTORE_PORT ?? 8088);

// 繝悶Λ繧ｦ繧ｶ螳溯｡梧凾縺ｮ縺ｿ繧ｨ繝溘Η謗･邯夲ｼ・SR/HMR 螟夐㍾蟇ｾ遲悶・荳蜉ｩ・・
export const isLocalhost = USE_EMU && typeof window !== "undefined";
