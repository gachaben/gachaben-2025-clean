// ------------------------------------------------------
// 🎵 src/utils/updateDoremiPoints.js
// Firestore の users/{uid} に doremiPoints を加算保存
// ------------------------------------------------------
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/fbkit";

/**
 * ドレミポイント加算ユーティリティ
 * @param {string} uid - ユーザーID
 * @param {number} addPoints - 加算するポイント（例：10）
 */
export async function updateDoremiPoints(uid, addPoints = 0) {
  if (!uid) throw new Error("uid が指定されていません");

  const userRef = doc(db, "users", uid);

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      // 既存ユーザー → 加算
      await updateDoc(userRef, {
        doremiPoints: increment(addPoints),
        updatedAt: new Date(),
      });
    } else {
      // 初回ユーザー → 新規作成
      await setDoc(userRef, {
        doremiPoints: addPoints,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log(`🎵 ${addPoints} DP を加算しました`);
  } catch (err) {
    console.error("❌ updateDoremiPoints 失敗:", err);
    throw err;
  }
}
