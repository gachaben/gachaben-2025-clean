// src/legacy_deprecated/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";

const app = initializeApp({
  apiKey: "demo",
  projectId: "demo-project",
  appId: "demo",
});

// ストリーミング失敗対策（CORS回避に効く）
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true, // ←自動的にlong-pollingへfallback
  ignoreUndefinedProperties: true,
});

export const auth = getAuth(app);

// Emulator 接続を localhost で統一
if (typeof window !== "undefined") {
  try { connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true }); } catch {}
  try { connectFirestoreEmulator(db, "localhost", 8080); } catch {}
}

export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}
