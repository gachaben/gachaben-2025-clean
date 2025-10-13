// src/utils/useHearts.js
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import { getFirestoreDb, getFirebaseAuth } from "@/fbkit";

/**
 * ❤️ ハート関連のユーティリティ
 */
export async function consumeHeart() {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("ログインしてください");

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const hearts = snap.data()?.hearts ?? 0;
  console.log("[consumeHeart] 現在ハート:", hearts);

  if (hearts <= 0) {
    console.warn("💔 ハートが足りません");
    return false;
  }

  await updateDoc(ref, { hearts: increment(-1) });
  console.log("[consumeHeart] Firestore 更新完了");
  return true;
}


/**
 * 💖 ハートをn個回復
 */
export async function restoreHearts(amount = 1) {
  const db = getFirestoreDb();
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("ログインしてください");

  const ref = doc(db, "users", user.uid);
  await updateDoc(ref, { hearts: increment(amount) });
  console.log(`💖 ハートを${amount}個回復`);
}
