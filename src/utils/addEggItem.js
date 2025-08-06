import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // パスは調整してね

export async function addEggItem(uid, itemId) {
  const itemRef = doc(db, "userItemPowers", `${uid}_${itemId}`);
  const snap = await getDoc(itemRef);

  if (snap.exists()) {
    console.log("⚠️ すでにこの卵は持っています！");
    return;
  }

  await setDoc(itemRef, {
    uid,
    itemId,
    pw: 0,
    currentStage: "egg",
  });

  console.log("✅ 卵をゲット＆保存しました！");
}
