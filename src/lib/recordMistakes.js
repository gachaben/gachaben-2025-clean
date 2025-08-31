// src/lib/recordMistakes.js
import { getFirebaseAuth } from "@/fbkit";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/fbkit";


export async function recordMistake(payload) {
  const auth = getFirebaseAuth();
  const uid = auth.currentUser?.uid ?? "guest";
  const toStr = (v) => (v === undefined || v === null ? "" : String(v));

  const base = {
    userId: uid,
    questionId: payload.questionId ?? null,
    question: toStr(payload.question),
    userAnswer: toStr(payload.userAnswer),
    correctAnswer: toStr(payload.correctAnswer),
    type: payload.type ?? "mcq", // ↁE出題タイプを保存（既定�E mcq�E�E
    options: Array.isArray(payload.options) ? payload.options.map(toStr) : null,
    meta: payload.meta ?? null,
    status: "open",
    times: 1,
    createdAt: serverTimestamp(),
    lastWrongAt: serverTimestamp(),
  };

  // 既存�Eドキュメントがあれば更新
  if (payload.questionId) {
    const qref = query(
      collection(db, "mistakes"),
      where("userId", "==", uid),
      where("questionId", "==", payload.questionId)
    );
    const snap = await getDocs(qref);
    if (!snap.empty) {
      const ref = snap.docs[0].ref;
      await updateDoc(ref, {
        times: (snap.docs[0].data().times ?? 1) + 1,
        lastWrongAt: serverTimestamp(),
        status: "open",
        type: base.type, // ↁE既存更新時も最新の type に揁E��めE
        options: base.options ?? snap.docs[0].data().options ?? null,
        correctAnswer: base.correctAnswer,
        question: base.question,
      });
      return ref.id;
    }
  }

  // 新規作�E
  const ref = await addDoc(collection(db, "mistakes"), base);
  return ref.id;
}
