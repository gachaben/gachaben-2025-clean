// src/legacy_deprecated/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, from "@/firebase", signInAnonymously } from "firebase/auth";
import { initializeFirestore, from "@/firebase" } from "firebase/firestore";

const PROJECT_ID = "demo-gachaben"; // ← エミュ用の projectId。必要ならここだけ変えてOK

// 既に初期化済みなら再利用
const app = getApps().length ? getApp() : initializeApp({
  apiKey: "demo",
  projectId: PROJECT_ID,
  appId: "demo",
});

// Firestore（ロングポーリング fallback 等）
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true,
});

// --- debug: 接続先プロジェクトをログに出す ---
try {
  console.log("🔥 Firestore projectId:", db.app.options.projectId);
} catch (e) {
  console.log("🔥 Firestore projectId: <unknown>", e);
}

export const auth = getAuth(app);

// Emulator 接続（localhost固定）
if (typeof window !== "undefined") {
  try {
    from "@/firebase"(auth, "http://localhost:9099", { disableWarnings: true });
    console.log("✅ Auth emulator connected :9099");
  } catch (e) {
    console.warn("⚠️ Auth emulator connect failed", e);
  }
  try {
    from "@/firebase"(db, "localhost", 8080);
    console.log("✅ Firestore emulator connected :8080");
  } catch (e) {
    console.warn("⚠️ Firestore emulator connect failed", e);
  }
}

// 匿名サインイン（必要時）
export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export { app };
