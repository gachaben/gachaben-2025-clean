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

const getMetaFromId = (itemId) => {
  const parts = itemId.split("_");
  const rank = parts[1]; // S, A, B
  const stageStr = parts[parts.length - 1];
  const stage = parseInt(stageStr.replace("stage", ""));
  let pw = 1000;

  if (rank === "S") pw = 2000;
  else if (rank === "A") pw = 1500;

  const imageName = itemId; // ✅ 拡張子なし

  return { stage, pw, imageName };
};

const rebuildItems = async () => {
  const entries = Object.entries(itemNames);
  let count = 0;

  for (const [itemId, name] of entries) {
    const { stage, pw, imageName } = getMetaFromId(itemId);
    const docRef = doc(db, "items", itemId);
    await setDoc(docRef, {
      itemId,
      name,
      stage,
      pw,
      imageName
    });
    console.log(`✅ 作成: ${itemId}（${name}）`);
    count++;
  }

  console.log(`🎉 完了：${count} 件のアイテムを再登録しました！`);
};

rebuildItems();
