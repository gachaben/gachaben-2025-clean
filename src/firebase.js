// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  initializeFirestore,
  connectFirestoreEmulator,
  setLogLevel,
} from "firebase/firestore";

// ▶ 本番用プロジェクトIDは必要になった時に差し替え
const PROD_PROJECT_ID = ""; // 例: "gachaben-prod"
const EMU_PROJECT_ID  = "demo-gachaben";

const useEmu =
  (typeof location !== "undefined" &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1")) ||
  import.meta?.env?.VITE_USE_EMU === "true";

const PROJECT_ID = useEmu ? EMU_PROJECT_ID : (import.meta.env.VITE_FIREBASE_PROJECT_ID || PROD_PROJECT_ID);

const firebaseConfig = {
  apiKey: "demo",
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Safari 安定化
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});
export const auth = getAuth(app);

if (useEmu) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", Number(import.meta.env.VITE_FIRESTORE_PORT || 8088));
  setLogLevel("debug");
  console.log("[EMU] connected → Auth:9099 / Firestore:", import.meta.env.VITE_FIRESTORE_PORT || 8088);
  console.log("[EMU] projectId =", app.options.projectId);
}

export { app };
