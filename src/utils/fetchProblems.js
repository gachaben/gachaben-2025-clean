import { collection, getDocs, query, where, limit as qLimit } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";   // ← ここ修正！

const db = getFirestoreDb();

/**
 * Firestoreの problems をオプションで絞り込んで取得
 * @param {Object} opts
 * @param {'textbook'|'challenge'} [opts.category]
 * @param {'jp'|'math'|'sci'|'soc'|'eng'|'challenge'} [opts.subject]
 * @param {number} [opts.grade]
 * @param {number} [opts.level]
 * @param {number} [opts.limit]  // 既定 50
 */
export async function fetchProblems(opts = {}) {
  const { category, subject, grade, level, limit = 50 } = opts;
  const colRef = collection(db, "problems");

  const clauses = [];
  if (category) clauses.push(where("category", "==", category));
  if (subject)  clauses.push(where("subject", "==", subject));
  if (typeof grade === "number") clauses.push(where("grade", "==", grade));
  if (typeof level === "number") clauses.push(where("level", "==", level));

  const q = clauses.length
    ? query(colRef, ...clauses, qLimit(limit))
    : query(colRef, qLimit(limit));

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
