import dotenv from "dotenv";
dotenv.config();

import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc, // ← これが必須！
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

const USE_EMU = process.env.VITE_USE_EMU === "true";
const FIRESTORE_PORT = Number(process.env.VITE_FIRESTORE_PORT || 8089);

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("USE_EMU =", USE_EMU, "PROJECT_ID =", firebaseConfig.projectId, "PORT =", FIRESTORE_PORT);

(async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (USE_EMU) {
    connectFirestoreEmulator(db, "localhost", FIRESTORE_PORT);
    console.log(`[FBKIT] Firestore -> emulator (${FIRESTORE_PORT})`);
  }

  const ref = doc(collection(db, "problems"));
  await setDoc(ref, {
    grade: 3,
    subject: "math",
    unit: "かけ算",
    level: 1,
    category: "textbook", // ← 追加
    body: { q: "3×4=", a: "12" },
  });

  console.log("✅ problems に1件追加:", ref.id);
})();
