// scripts/seedMistakes.js
import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const USE_EMU = true;
const FIRESTORE_PORT = 8089;
const SAMPLE_UID = "demo-user";

const firebaseConfig = {
  apiKey: "demo",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-gachaben",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  console.log("🔥 Firestore Emulator connected");
}

// ---------------- サンプル Mistakes ----------------
const sampleMistakes = [
  { question: "3×4=", correct: "12", answer: "13", subject: "算数", grade: 3 },
  { question: "8×6=", correct: "48", answer: "46", subject: "算数", grade: 3 },
  { question: "光合成に必要なものは？", correct: "二酸化炭素", answer: "酸素", subject: "理科", grade: 5 },
  { question: "鎌倉幕府を開いたのは？", correct: "源頼朝", answer: "足利尊氏", subject: "社会", grade: 6 },
  { question: "He ___ a book.", correct: "has", answer: "have", subject: "英語", grade: 6 },
  { question: "犬を英語で言うと？", correct: "dog", answer: "cat", subject: "英語", grade: 4 },
  { question: "赤と青を混ぜると？", correct: "紫", answer: "緑", subject: "図工", grade: 2 },
  { question: "夏目漱石の代表作は？", correct: "吾輩は猫である", answer: "羅生門", subject: "国語", grade: 6 },
  { question: "5×9=", correct: "45", answer: "49", subject: "算数", grade: 3 },
  { question: "江戸時代の将軍の数は？", correct: "15", answer: "10", subject: "社会", grade: 6 },
];

// ---------------- メイン処理 ----------------
async function main() {
  console.log("🌱 Seeding mistakes...");
  for (const m of sampleMistakes) {
    await addDoc(collection(db, "mistakes"), {
      uid: SAMPLE_UID,
      ...m,
      status: "open",
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Added: ${m.question}`);
  }
  console.log("🌸 Done seeding mistakes!");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error seeding mistakes:", e);
  process.exit(1);
});
