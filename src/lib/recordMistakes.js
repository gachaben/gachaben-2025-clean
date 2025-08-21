// src/lib/recordMistakes.js
import { collection, addDoc, serverTimestamp, db } from "/src/fbkit";

/**
 * ユーザーの間違えた問題を Firestore に保存
 * @param {string} userId
 * @param {{question:string, answer:string, correctAnswer:string}} mistake
 */
export async function recordMistake(userId, mistake) {
  const safe = {
    ...mistake,
    userId,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "mistakes"), safe);
  console.log("✅ mistake written docId:", ref.id);
  return ref.id;
}
