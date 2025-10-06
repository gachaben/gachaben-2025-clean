import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
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
  if (import.meta.env.DEV) console.log("🔥 mistake stored:", id, payload);
}
