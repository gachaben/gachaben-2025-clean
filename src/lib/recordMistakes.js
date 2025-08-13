import { db } from "../firebase";
import {
  doc, getDoc, setDoc, serverTimestamp, updateDoc,
} from "firebase/firestore";

/**
 * wrongs: Array<{
 *   questionId: string,
 *   snapshot?: any   // 問題文/選択肢/正解など、後で復習に必要な最小限
 * }>
 * source: "battle" | "challenge"
 */
export async function recordMistakes({ uid, wrongs, source }) {
  if (!wrongs?.length) return;

  const now = serverTimestamp();
  const ops = wrongs.map(async (w) => {
    const id = `${uid}_${w.questionId}_${source}`;
    const ref = doc(db, "mistakes", id);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const cur = snap.data();
      await updateDoc(ref, {
        status: "pending",
        lastTriedAt: now,
        timesWrong: (cur.timesWrong ?? 0) + 1,
        // 最新のスナップに更新しておくと復習が壊れにくい
        snapshot: w.snapshot ?? cur.snapshot ?? null,
      });
    } else {
      await setDoc(ref, {
        uid,
        questionId: w.questionId,
        source,
        status: "pending",
        createdAt: now,
        lastTriedAt: now,
        timesWrong: 1,
        snapshot: w.snapshot ?? null,
      });
    }
  });

  await Promise.all(ops);
}
