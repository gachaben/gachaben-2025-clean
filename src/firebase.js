// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  setLogLevel,
} from "firebase/firestore";

const PROJECT_ID = "demo-gachaben";

const firebaseConfig = {
  apiKey: "demo",
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 👇 Safari 対策：Long Polling / fetch streams 無効
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export const auth = getAuth(app);

// 開発時 or ENVで切り替え
const isLocal =
  typeof location !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1");
const useEmu = isLocal || import.meta?.env?.VITE_USE_EMU === "true";

if (useEmu) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8088); // ← firebase.json と同じ 8088
  setLogLevel("debug");
  console.log("[EMU] connected → Auth:9099 / Firestore:8088");
  console.log("[EMU] projectId =", app.options.projectId);
}

export { app };
