// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { itemNames } from "./itemNames.js"; // 竊・逶ｸ蟇ｾ繝代せ豕ｨ諢・

// Firebase險ｭ螳夲ｼ医≠縺ｪ縺溘・縺ｾ縺ｾ縺ｧOK・・
const firebaseConfig = {
  apiKey: "AIzaSyCV8UNRLnbdoeWkLA_azeMWJyflw0iw",
  authDomain: "gachaben-2025.firebaseapp.com",
  projectId: "gachaben-2025",
  storageBucket: "gachaben-2025.appspot.com",
  messagingSenderId: "929195735227",
  appId: "1:929195735227:web:94167de85ef28bf724942f"
};

// Firebase 蛻晄悄蛹・
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// name繝輔ぅ繝ｼ繝ｫ繝峨ｒ霑ｽ蜉 or 譖ｴ譁ｰ
async function updateAllNames() {
  for (const [itemId, name] of Object.entries(itemNames)) {
    const docRef = doc(db, "items", itemId);
    await setDoc(docRef, { name }, { merge: true });
    console.log(`笨・Updated: ${itemId} 竊・${name}`);
  }
}

updateAllNames();
