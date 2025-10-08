// scripts/seedMistakes.js
import dotenv from "dotenv";
dotenv.config();

import {
  initializeApp
} from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  connectFirestoreEmulator
} from "firebase/firestore";

// --- 設定 ---
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

// --- Firebase初期化 ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
if (USE_EMU) {
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  console.log("🔥 Firestore Emulator connected");
}

// --- Mistakesデータ ---
const mistakes = [
  {
    uid: "2pUqxw9GpYuBMY7B06cvOgyQ1hUF",
    subject: "算数",
    grade: "小3",
    question: "3×4=",
    correct: "12",
    choices: ["6", "8", "12", "18"],
  },
  {
    uid: "2pUqxw9GpYuBMY7B06cvOgyQ1hUF",
    subject: "理科",
    grade: "小5",
    question: "光合成に必要なものは？",
    correct: "二酸化炭素・水・光",
    choices: ["酸素・水", "二酸化炭素・水・光", "酸素・光", "水・土"],
  },
];

// --- Firestoreに投入 ---
async function seedMistakes() {
  console.log("🌱 Seeding mistakes...");

  for (const m of mistakes) {
    const ref = doc(collection(db, "mistakes"));
    await setDoc(ref, m);
    console.log(`✅ Added: ${m.subject} - ${m.question}`);
  }

  console.log("🎉 Done seeding mistakes!");
}

seedMistakes().catch((err) => console.error(err));
