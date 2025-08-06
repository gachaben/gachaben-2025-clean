import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { itemNames } from "./itemNames.js";

const firebaseConfig = {
  apiKey: "AIzaSyCV8UNRLnbdoeWkLA_azeMWJyflw0iw",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.appspot.com",
  messagingSenderId: "929195735227",
  appId: "1:929195735227:web:94167de85ef28bf724942f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const updateItemNames = async () => {
  const entries = Object.entries(itemNames);
  let count = 0;

  for (const [itemId, name] of entries) {
    const docRef = doc(db, "items", itemId);
    await setDoc(docRef, { name }, { merge: true }); // ← 上書きではなく追記！
    console.log(`✅ ${itemId} に name: ${name} を追加`);
    count++;
  }

  console.log(`🎉 完了！${count} 件の name を追加しました！`);
};

updateItemNames();
