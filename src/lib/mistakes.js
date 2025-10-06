<<<<<<< HEAD
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
=======
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
import { getFirestoreDb } from "@/fbkit";

/**
 * 間違えた問題を mistakes に upsert（同じ問題は times++）
 */
export async function addMistake(uid, problem) {
  if (!uid) throw new Error("NO_AUTH");
  const db = getFirestoreDb();

  const id = `${uid}_${problem.id}`;
  const ref = doc(db, "mistakes", id);

  const prev = await getDoc(ref);
  const old = prev.exists() ? prev.data() : null;

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
    status: "open",
    times: old ? (old.times || 1) + 1 : 1,
    lastWrongAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });
<<<<<<< HEAD
>>>>>>> 3c6d39a (feat: addMistake 実装（ProblemsTestPageで不正解時にmistakesへ保存できるようにした）)
=======
  if (import.meta.env.DEV) console.log("🔥 mistake stored:", id, payload);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
}
