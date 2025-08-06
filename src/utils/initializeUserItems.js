// 📄 src/utils/initializeUserItems.js

import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// ユーザーにアイテムIDを自動登録（egg形式ではなくS/A/B形式）
export const initializeUserItems = async (uid) => {
  const items = [
    "2508_A_001_herakuresu_stage1",
    "2508_A_002_ageha_stage1",
    "2508_A_003_hati_stage1"
  ];

  await setDoc(
    doc(db, "users", uid),
    { items },
    { merge: true }
  );

  console.log("初期化完了しました！");
};
