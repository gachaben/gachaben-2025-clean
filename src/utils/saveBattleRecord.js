// ------------------------------------------------------
// 🧾 saveBattleRecord.js
// Firestore: バトル履歴を保存
// ------------------------------------------------------
import { db } from "@/fbkit";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * バトル結果を Firestore に保存
 * @param {Object} data - 保存内容
 * @param {string} data.uid - ユーザーID
 * @param {string} data.opponent - 対戦相手（例: CPU, ゆうと など）
 * @param {string} data.result - "win" / "lose" / "draw"
 * @param {number} data.score - スコア（正解数など）
 * @param {Object} [data.meta] - 任意の追加情報
 * @returns {Promise<string>} FirestoreドキュメントID
 */
export async function saveBattleRecord({
  uid,
  opponent = "CPU",
  result = "win",
  score = 0,
  meta = {},
}) {
  if (!uid) throw new Error("ユーザーIDがありません");

  const ref = collection(db, "battleRecords");

  const docRef = await addDoc(ref, {
    uid,
    opponent,
    result,
    score,
    meta,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
