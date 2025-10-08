// scripts/ensureLoginMap.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
} from "firebase/auth";

const USE_EMU = process.env.VITE_USE_EMU === "true";
const FIRESTORE_PORT = process.env.VITE_FIRESTORE_PORT || 8089;
const AUTH_PORT = process.env.VITE_AUTH_PORT || 9099;

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ エミュ接続を忘れずに！
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", Number(FIRESTORE_PORT));
  connectAuthEmulator(auth, "http://127.0.0.1:" + AUTH_PORT);
  console.log("✅ Emulator connected (Firestore & Auth)");
}

async function ensureLoginMap() {
  // 🔹 ログイン（Emulator上の test@example.com を使用）
  const email = "test@example.com";
  const password = "password";
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  // 🔹 Firestoreにデータ作成
  const userRef = doc(db, "users", uid);
  await setDoc(
    userRef,
    {
      login: {
        earnedNotes: ["ど", "れ", "み"],
        streakDays: 3,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`🎵 Updated login map for user: ${uid}`);
}

ensureLoginMap()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  });
