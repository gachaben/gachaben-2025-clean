// ------------------------------------------------------
// ✅ scripts/seedProblems.js
// ガチャ弁バトル用テスト問題を Firestore に投入（Emulator対応）
// ------------------------------------------------------
import dotenv from "dotenv";
dotenv.config();

import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// ------------------------------------------------------
// ⚙️ 環境設定
// ------------------------------------------------------
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

console.log(
  "USE_EMU =", USE_EMU,
  "PROJECT_ID =", firebaseConfig.projectId,
  "PORT =", FIRESTORE_PORT
);

// ------------------------------------------------------
// 🚀 Firestore 初期化
// ------------------------------------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (USE_EMU) {
  connectFirestoreEmulator(db, "localhost", FIRESTORE_PORT);
  console.log(`[FBKIT] Firestore -> emulator (${FIRESTORE_PORT})`);
}

// ------------------------------------------------------
// 🧩 登録するサンプル問題セット
// ------------------------------------------------------
const problems = [
  {
    grade: 3,
    subject: "math",
    unit: "かけ算",
    level: 1,
    category: "textbook",
    text: "3×4は？",
    choices: ["6", "8", "9", "12"],
    answer: "12",
  },
  {
    grade: 3,
    subject: "math",
    unit: "かけ算",
    level: 2,
    category: "textbook",
    text: "6×7は？",
    choices: ["36", "40", "42", "49"],
    answer: "42",
  },
  {
    grade: 3,
    subject: "math",
    unit: "かけ算",
    level: 3,
    category: "textbook",
    text: "9×8は？",
    choices: ["64", "72", "81", "63"],
    answer: "72",
  },
];

// ------------------------------------------------------
// 💾 Firestore へ書き込み
// ------------------------------------------------------
(async () => {
  try {
    for (const p of problems) {
      const ref = doc(collection(db, "problems"));
      await setDoc(ref, p);
      console.log(`✅ 追加完了: ${p.text} → ${ref.id}`);
    }
    console.log("🎉 すべての問題を Firestore に投入しました！");
  } catch (err) {
    console.error("❌ 書き込みエラー:", err);
  }
})();
