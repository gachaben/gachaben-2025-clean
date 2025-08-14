// src/lib/recordMistakes.js
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * 間違いを記録（同じ battleId x questionId は上書き＝二重保存なし）
 * ルール:
 *  - ドキュメントが存在しない → createdAt / updatedAt を両方付与
 *  - 既に存在する        → updatedAt のみ更新（createdAt は保持）
 *
 * @param {{battleId:string, questionId:string, round?:number, choice?:string, correct?:string, userId?:string, difficulty?:string}} m
 * @returns {Promise<string>} id（= `${battleId}_${questionId}`）
 */
export async function recordMistake(m) {
  if (!m?.battleId || !m?.questionId) {
    throw new Error("recordMistake: battleId and questionId are required");
  }

  // 同一バトル同一問題で一意
  const id = `${m.battleId}_${m.questionId}`;
  const ref = doc(db, "mistakes", id);

  // まず存在確認
  const snap = await getDoc(ref);
  const base = {
    battleId: m.battleId,
    questionId: m.questionId,
    round: m.round ?? null,
    choice: m.choice ?? null,
    correct: m.correct ?? null,
    userId: m.userId ?? null,
    difficulty: m.difficulty ?? null,
  };

  if (!snap.exists()) {
    // 初回作成: createdAt / updatedAt を両方付与
    await setDoc(
      ref,
      {
        ...base,
        // 互換用に残したいなら wrongAt も同じ値で保存
        wrongAt: serverTimestamp(),
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
