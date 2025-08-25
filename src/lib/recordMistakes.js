// src/lib/recordMistakes.js
import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/fbkit";


export async function recordMistake(payload) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid ?? "guest";
  const toStr = (v) => (v === undefined || v === null ? "" : String(v));

  const base = {
    userId: uid,
    questionId: payload.questionId ?? null,
    question: toStr(payload.question),
    userAnswer: toStr(payload.userAnswer),
    correctAnswer: toStr(payload.correctAnswer),
    type: payload.type ?? "mcq", // 竊・蜃ｺ鬘後ち繧､繝励ｒ菫晏ｭ假ｼ域里螳壹・ mcq・・
    options: Array.isArray(payload.options) ? payload.options.map(toStr) : null,
    meta: payload.meta ?? null,
    status: "open",
    times: 1,
    createdAt: serverTimestamp(),
    lastWrongAt: serverTimestamp(),
  };

  // 譌｢蟄倥・繝峨く繝･繝｡繝ｳ繝医′縺ゅｌ縺ｰ譖ｴ譁ｰ
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
        type: base.type, // 竊・譌｢蟄俶峩譁ｰ譎ゅｂ譛譁ｰ縺ｮ type 縺ｫ謠・∴繧・
        options: base.options ?? snap.docs[0].data().options ?? null,
        correctAnswer: base.correctAnswer,
        question: base.question,
      });
      return ref.id;
    }
  }

  // 譁ｰ隕丈ｽ懈・
  const ref = await addDoc(collection(db, "mistakes"), base);
  return ref.id;
}
