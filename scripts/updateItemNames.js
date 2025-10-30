// @KEEP 琁E��: 柱�E�❤/ガチャ/ミッション/ランキング/問題履歴�E�に一致
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { itemNames } from "../src/itemNames.js"; // ↁE相対パス注愁E

// Firebase設定（あなた�EままでOK�E�E
const firebaseConfig = {
  apiKey: "AIzaSyCV8UNRLnbdoeWkLA_azeMWJyflw0iw",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.appspot.com",
  messagingSenderId: "929195735227",
  appId: "1:929195735227:web:94167de85ef28bf724942f"
};

// Firebase 初期匁E
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// nameフィールドを追加 or 更新
async function updateAllNames() {
  for (const [itemId, name] of Object.entries(itemNames)) {
    const docRef = doc(db, "items", itemId);
    await setDoc(docRef, { name }, { merge: true });
    console.log(`✁EUpdated: ${itemId} ↁE${name}`);
  }
}

updateAllNames();
