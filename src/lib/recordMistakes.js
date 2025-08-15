// src/lib/recordMistakes.js
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

/**
 * 間違いを記録（同じ battleId x questionId は上書き＝二重保存なし）
 *
 * @param {{
 *   battleId: string,
 *   questionId: string,
 *   round?: number,
 *   choice?: string,
 *   correct?: string,
 *   text?: string|null,
 *   difficulty?: string|null,
 *   subject?: string|null,   // ★ 追加
 *   unit?: string|null,      // ★ 追加
 *   userId?: string|null
 * }} m
 * @returns {Promise<string>} id (= `${battleId}_${questionId}`)
 */
export async function recordMistake(m) {
  if (!m?.battleId || !m?.questionId) {
    throw new Error("recordMistake: battleId and questionId are required");
  }

  const auth = getAuth();
  const uid = m.userId ?? auth.currentUser?.uid ?? null;
  if (!uid) throw new Error("recordMistake: not signed in (uid missing)");

  const id = `${m.battleId}_${m.questionId}`;
  const ref = doc(db, "mistakes", id);

  const base = {
    uid,
    battleId: m.battleId,
    questionId: m.questionId,
    round: m.round ?? null,
    choice: m.choice ?? null,
    correct: m.correct ?? null,
    text: m.text ?? null,
    difficulty: m.difficulty ?? null,
    subject: m.subject ?? null,   // ★ 追加
    unit: m.unit ?? null,         // ★ 追加
  };

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(
      ref,
      {
        ...base,
        wrongAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await updateDoc(ref, {
      ...base,
      updatedAt: serverTimestamp(),
    });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("📝 mistake saved:", id);
  }
  return id;
}
