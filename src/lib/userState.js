import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";   // ← 追加

// Firestore インスタンスを取得
const db = getFirestoreDb();

// users/{uid} の参照
export const userDocRef = (uid) => doc(db, "users", String(uid));

// 初回作成（存在しなければ作る）
export async function ensureUserDoc(uid) {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: "Demo User",
      hearts: 5,
      battleTickets: 3,
      daily: { date: null },
      createdAt: serverTimestamp(),
    });
  }
  return ref;
}

// 日次リセット処理（例：日付が変わっていたらリセット）
export async function refreshUserDaily(uid) {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data = snap.data() || {};
  const last = data.daily?.date ?? null;

  if (last !== today) {
    await updateDoc(ref, {
      daily: { date: today },
      updatedAt: serverTimestamp(),
    });
  }
}
