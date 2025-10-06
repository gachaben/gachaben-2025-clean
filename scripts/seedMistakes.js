// scripts/seedMistakes.js
import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";

const USE_EMU = process.env.VITE_USE_EMU === "true";
const FIRESTORE_PORT = process.env.VITE_FIRESTORE_PORT || 8089;

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", Number(FIRESTORE_PORT));
  console.log(`[EMULATOR] Firestore connected → ${FIRESTORE_PORT}`);
}

// ------------------------------
// Mistakes サンプルデータ投入
// ------------------------------
async function seedMistakes() {
  console.log("🔥 Mistakes seeding start...");

  // 既存mistakes削除（エミュ用）
  const snap = await getDocs(collection(db, "mistakes"));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
  console.log(`🧹 Cleared old mistakes (${snap.size})`);

  // サンプルデータ（10件）
  const samples = [
    { question: "3×4=", answer: "13", correct: "12" },
    { question: "8÷2=", answer: "3", correct: "4" },
    { question: "5×7=", answer: "30", correct: "35" },
    { question: "6＋8=", answer: "12", correct: "14" },
    { question: "9−3=", answer: "5", correct: "6" },
    { question: "4×9=", answer: "35", correct: "36" },
    { question: "7×6=", answer: "30", correct: "42" },
    { question: "2×8=", answer: "14", correct: "16" },
    { question: "10−7=", answer: "1", correct: "3" },
    { question: "12÷3=", answer: "2", correct: "4" },
  ];

  for (const s of samples) {
    await addDoc(collection(db, "mistakes"), {
      uid: "guest",
      problemId: `p_${s.question.replace(/[^0-9x÷＋−]/g, "")}`,
      question: s.question,
      answer: s.answer,
      correct: s.correct,
      createdAt: new Date().toISOString(),
    });
  }

  console.log(`✅ Inserted ${samples.length} sample mistakes.`);
  console.log("🎉 Mistakes seed complete.");
}

seedMistakes().then(() => process.exit(0));
