// ------------------------------------------------------
// 🎵 updateDoremiPoints.js
// Firestore: ユーザーのドレミポイントを加算する
// ------------------------------------------------------
import { db } from "@/fbkit";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

/**
 * ドレミポイントを加算する
 * @param {string} uid - ユーザーID
 * @param {number} add - 加算ポイント数
 */
export async function updateDoremiPoints(uid, add = 0) {
  if (!uid || add === 0) return;

  const ref = doc(db, "users", uid);

  try {
    const snap = await getDoc(ref);

    if (snap.exists()) {
      // 既存ユーザー → doremiPoints を加算
      await updateDoc(ref, {
        doremiPoints: increment(add),
        updatedAt: new Date(),
      });
    } else {
      // 新規ユーザーの場合 → 新規作成
      await setDoc(ref, {
        doremiPoints: add,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`🎵 ${add} ドレミポイントを加算しました`);
  } catch (e) {
    console.error("❌ ドレミポイント加算エラー:", e);
    throw e;
  }
}
