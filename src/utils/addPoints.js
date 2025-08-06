import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase"; // ← パスは環境に合わせて！

export async function addPoints(uid, amount) {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, {
      points: increment(amount),
    });
    console.log(`✅ ${amount}ポイント加算しました`);
  } catch (error) {
    console.error("❌ ポイント加算エラー:", error);
  }
}
