import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { itemNames } from "./itemNames.js"; // ← 相対パス注意

// Firebase設定（あなたのままでOK）
const firebaseConfig = {
  apiKey: "AIzaSyCV8UNRLnbdoeWkLA_azeMWJyflw0iw",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.appspot.com",
  messagingSenderId: "929195735227",
  appId: "1:929195735227:web:94167de85ef28bf724942f"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// nameフィールドを追加 or 更新
async function updateAllNames() {
  for (const [itemId, name] of Object.entries(itemNames)) {
    const docRef = doc(db, "items", itemId);
    await setDoc(docRef, { name }, { merge: true });
    console.log(`✅ Updated: ${itemId} → ${name}`);
  }
}

updateAllNames();
