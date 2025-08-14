// src/lib/getMistakes.js
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/**
 * ログイン中ユーザーの間違い履歴を取得
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getMistakes(userId) {
  if (!userId) throw new Error("getMistakes: userId is required");

  const q = query(
    collection(db, "mistakes"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
}
