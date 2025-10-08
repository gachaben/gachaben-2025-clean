// scripts/seedMistakes.mjs
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  connectFirestoreEmulator,
  serverTimestamp,
} from "firebase/firestore";

// ==== Firebase Emulator 設定 ==== //
const firebaseConfig = {
  apiKey: "AIzaSyCYoonUtU7leRNcHx0lKA_azeMWvjFYTuo",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.firebasestorage.app",
  messagingSenderId: "929513375207",
  appId: "1:929513375207:web:94167d7e05eff28b7f2942",
};

// ==== UIDを固定 ==== //
const UID = "kppNnJ35eEJd4hofXuhYbEDZv6s5";

// ==== Firestore初期化 ==== //
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8089);

// ==== テストデータ ==== //
const problems = [
  {
    subject: "国語",
    grade: "小3",
    question: "ごんは何を村人に返しましたか？",
    choices: ["魚", "まつたけ", "くり", "はちみつ"],
    answer: "魚",
    selected: "まつたけ",
  },
  {
    subject: "算数",
    grade: "小3",
    question: "3×4は？",
    choices: ["6", "7", "8", "12"],
    answer: "12",
    selected: "8",
  },
  {
    subject: "理科",
    grade: "小3",
    question: "地球は何のまわりを回っている？",
    choices: ["月", "太陽", "火星", "金星"],
    answer: "太陽",
    selected: "月",
  },
  {
    subject: "社会",
    grade: "小3",
    question: "日本の首都はどこ？",
    choices: ["大阪", "京都", "東京", "札幌"],
    answer: "東京",
    selected: "京都",
  },
  {
    subject: "英語",
    grade: "小3",
    question: "apple は日本語で何？",
    choices: ["りんご", "バナナ", "ぶどう", "みかん"],
    answer: "りんご",
    selected: "バナナ",
  },
];

// ==== Firestoreへ書き込み ==== //
(async () => {
  console.log(`👤 UID: ${UID}`);
  console.log("🧾 Seeding 5 mistakes...");

  for (const p of problems) {
    const ref = doc(collection(db, "mistakes"));
    await setDoc(ref, {
      uid: UID,
      ...p,
      isCorrect: false,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Added: ${p.subject} - ${p.question}`);
  }

  console.log("🎉 完了：Firestore Emulator に5件追加しました");
})();
