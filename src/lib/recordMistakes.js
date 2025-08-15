// src/lib/recordMistakes.js
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";

/**
 * 間違いを記録（同じ battleId x questionId は上書き＝二重保存なし）
 * ルール:
 *  - ドキュメントが存在しない → createdAt / updatedAt を両方付与
 *  - 既に存在する        → updatedAt のみ更新（createdAt は保持）
 *
 * @param {{
 *  battleId:string,
 *  questionId:string,
 *  round?:number,
 *  choice?:string,
 *  correct?:string,
 *  text?:string|null,
 *  difficulty?:string|null,
 *  subject?:string|null,
 *  unit?:string|null,
 *  options?:string[]|null,
 *  userId?:string|null
 * }} m
 * @returns {Promise<string>} id（= `${battleId}_${questionId}`）
 */
export async function recordMistake(m) {
  if (!m?.battleId || !m?.questionId) {
    throw new Error("recordMistake: battleId and questionId are required");
  }

  const uid = m.userId ?? getAuth().currentUser?.uid ?? null;

  // 同一バトル同一問題で一意
  const id = `${m.battleId}_${m.questionId}`;
  const ref = doc(db, "mistakes", id);

  // まず存在確認
  const snap = await getDoc(ref);

  const base = {
    uid,
    battleId: m.battleId,
    questionId: m.questionId,
    round: m.round ?? null,
    choice: m.choice ?? null,
    correct: m.correct ?? null,
    text: m.text ?? null,
    difficulty: m.difficulty ?? null,
    subject: m.subject ?? null,
    unit: m.unit ?? null,
    options: Array.isArray(m.options) ? m.options : null, // ★ ここがポイント！
  };

  if (!snap.exists()) {
    // 初回作成: createdAt / updatedAt を両方付与
    await setDoc(
      ref,
      {
        ...base,
        wrongAt: serverTimestamp(),   // 互換用
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // 2回目以降: データ更新 + updatedAt のみ更新（createdAt は保持）
    await updateDoc(ref, {
      ...base,
      updatedAt: serverTimestamp(),
    });
  }

  console.log("📝 mistake saved:", id);
  return id;
}
