// src/utils/assignRandomEgg.js
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

// ランダムに卵を1つ付与する関数
export const assignRandomEgg = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const randomNumber = String(Math.floor(Math.random() * 10 + 1)).padStart(3, "0"); // "001"〜"010"
  const eggId = `egg${randomNumber}`;

  const eggData = {
    [eggId]: {
      id: randomNumber,
      stage: "egg",
      power: 0,
    },
  };

  await setDoc(doc(db, "userItemPowers", user.uid), eggData, { merge: true });
  console.log("🥚 卵を付与しました:", eggId);
};
