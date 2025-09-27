// src/lib/mistakes.js
<<<<<<< HEAD
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

/**
 * バトルで間違えたときに記録する
 */
export async function recordMistake(question, userAnswer) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  try {
    await addDoc(collection(db, "mistakes"), {
      userId: uid,
      text: question.text || "(no text)",
      options: question.options || [],
      answer: question.answer,
      picked: userAnswer,
      type: question.type || "mcq",
      createdAt: serverTimestamp(),
      status: "open",
      times: 1,
    });
    console.log("[mistakes] added:", question.text);
  } catch (e) {
    console.error("[mistakes] add error:", e);
  }
=======
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
>>>>>>> 3c6d39a (feat: addMistake 実装（ProblemsTestPageで不正解時にmistakesへ保存できるようにした）)
}
