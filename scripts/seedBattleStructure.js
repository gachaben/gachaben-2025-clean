// scripts/seedBattleStructure.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
} from "firebase/firestore";

const app = initializeApp({
  projectId: "gachaben-2025",
});

const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8088); // ← 環境に合わせる

async function seedBattleData() {
  const uid = "demo-user";

  await setDoc(doc(db, "users", uid), {
    tickets: 7,
    stats: {
      battleNotes: 0,
      doremiPoints: 0,
      doremiRank: "ビギナー",
    },
    lastBattleAt: null,
  });

  await setDoc(doc(db, "progress", uid), {
    noteLights: 0,
    premiumReady: false,
  });

  console.log("✅ バトル構造データを作成しました");
}

seedBattleData();
