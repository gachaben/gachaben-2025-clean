// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth, connectAuthEmulator
} from "firebase/auth";
import {
  initializeFirestore, connectFirestoreEmulator, setLogLevel
} from "firebase/firestore";

const PROJECT_ID = "demo-gachaben";

const firebaseConfig = {
  apiKey: "demo",
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 👇 ここがポイント：Long Polling & fetch streams off
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export const auth = getAuth(app);

// ローカル or 環境変数で切替
const isLocal =
  typeof location !== "undefined" &&
  (location.hostname === "localhost" || location.hostname === "127.0.0.1");
const useEmu = isLocal || import.meta?.env?.VITE_USE_EMU === "true";

if (useEmu) {
  connectAuthEmulator(auth, "http://localhost:9099");
  connectFirestoreEmulator(db, "localhost", 8080);
  setLogLevel("debug");
  console.log("[EMU] connected → Auth:9099 / Firestore:8080");
  console.log("[EMU] projectId =", app.options.projectId);
}
