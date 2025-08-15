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
 * 仕様:
 *  - 初回作成: createdAt / updatedAt / wrongAt を付与
 *  - 2回目以降: updatedAt のみ更新（createdAt は保持）
 *  - onSnapshot 用に uid を必ず格納（where("uid","==",uid) で購読するため）
 *
 * @param {{
 *   battleId: string,
 *   questionId: string,
 *   round?: number,
 *   choice?: string,        // ユーザーが選んだ選択肢
 *   correct?: string,       // 正答
 *   text?: string|null,     // 問題文（渡せるなら）
 *   difficulty?: string|null,
 *   userId?: string|null    // 明示的指定も可（未指定なら currentUser から取得）
 * }} m
 * @returns {Promise<string>} id (= `${battleId}_${questionId}`)
 */
export async function recordMistake(m) {
  if (!m?.battleId || !m?.questionId) {
    throw new Error("recordMistake: battleId and questionId are required");
  }

  // uid は onSnapshot の where で使うため必須
  const auth = getAuth();
  const uid = m.userId ?? auth.currentUser?.uid ?? null;
  if (!uid) throw new Error("recordMistake: not signed in (uid missing)");

  // 同一バトル×同一問題で一意
  const id = `${m.battleId}_${m.questionId}`;
  const ref = doc(db, "mistakes", id);

  // 共通ペイロード
  const base = {
    uid,                         // ← これが超重要（購読で使用）
    battleId: m.battleId,
    questionId: m.questionId,
    round: m.round ?? null,
    choice: m.choice ?? null,
    correct: m.correct ?? null,
    text: m.text ?? null,
    difficulty: m.difficulty ?? null,
  };

  // 既存確認
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 初回作成: createdAt / updatedAt / wrongAt を付与
    await setDoc(
      ref,
      {
        ...base,
        wrongAt: serverTimestamp(),   // 互換用
        createdAt: serverTimestamp(), // 並び替え・QDF用
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    // 2回目以降: データ更新 + updatedAtのみ更新（createdAtは保持）
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
