// src/lib/userState.js
import { db } from "@/fbkit"; // 竊・縺薙ｌ蠢・・
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

// users/{uid} 縺ｮ蜿ら・
export const userDocRef = (uid) => doc(db, "users", uid);

// 蛻晏屓菴懈・・亥ｭ伜惠縺励↑縺代ｌ縺ｰ菴懊ｋ・・
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

// 譌･谺｡繝ｪ繧ｻ繝・ヨ・井ｾ具ｼ壽律莉倥′螟峨ｏ縺｣縺ｦ縺・◆繧峨Μ繧ｻ繝・ヨ・・
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
