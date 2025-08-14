// src/lib/recordMistakes.js
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * 間違いを記録（同じ battleId x questionId は上書き＝二重保存なし）
 * @param {{battleId:string, questionId:string, round:number, choice:string, correct:string, userId?:string, difficulty?:string}} m
 */
export async function recordMistake(m) {
  if (!m?.battleId || !m?.questionId) {
    throw new Error("recordMistake: battleId and questionId are required");
  }
  const id = `${m.battleId}_${m.questionId}`; // 重複ガード
  const ref = doc(db, "mistakes", id);
  await setDoc(ref, {
    battleId: m.battleId,
    questionId: m.questionId,
    round: m.round ?? null,
    choice: m.choice ?? null,
    correct: m.correct ?? null,
    userId: m.userId ?? null,
    difficulty: m.difficulty ?? null,
    wrongAt: serverTimestamp(),
  }, { merge: true }); // 追記しても重複しない
  console.log("📝 mistake saved:", id);
  return id;
}
