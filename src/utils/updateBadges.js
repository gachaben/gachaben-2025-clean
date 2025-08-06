// utils/updateBadges.js
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

// ユーザー1人にバッジを追加する
export const giveBadgeToUser = async (uid, badgeName) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.warn("ユーザーが見つかりませんでした:", uid);
    return;
  }

  await setDoc(userRef, {
    badgeList: arrayUnion(badgeName)
  }, { merge: true });

  console.log(`✅ ${badgeName} バッジを付与しました → ${uid}`);
};
