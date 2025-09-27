// src/lib/mistakes.js
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";

/**
 * 間違えた問題を mistakes コレクションに保存
 * @param {string} uid - ユーザーID
 * @param {object} problem - 問題データ
 */
export async function addMistake(uid, problem) {
  if (!uid) throw new Error("NO_AUTH");

  const db = getFirestoreDb();
  // ユニークID: ユーザーID + 問題ID
  const id = `${uid}_${problem.id}`;
  const ref = doc(db, "mistakes", id);

  const payload = {
    userId: uid,
    problemId: problem.id,
    question: problem.body?.question || problem.text || "",
    answer: problem.body?.answer ?? problem.answer ?? null,
    choices: problem.body?.choices ?? problem.choices ?? [],
    subject: problem.subject,
    grade: problem.grade,
    level: problem.level,
    category: problem.category,
    status: "open",                // ← 統一
    times: 1,                      // 初回は1
    lastWrongAt: serverTimestamp(),
  };

  // merge:true にすることで、既に存在すれば上書き
  await setDoc(ref, payload, { merge: true });
}
