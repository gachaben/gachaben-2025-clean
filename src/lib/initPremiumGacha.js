// src/lib/initPremiumGacha.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit/app";

export async function initPremiumGacha(uid) {
  const ref = doc(db, "users", uid, "stats", "premiumGacha");
  const snap = await getDoc(ref);
  const today = new Date().toISOString().split("T")[0];

  if (!snap.exists()) {
    await setDoc(ref, {
      freeUsed: false,
      adUsedCount: 0,
      noteCount: 0,
      lastUsedAt: today,
      totalDraws: 0,
    });
  } else {
    const data = snap.data();
    // 日付が変わっていたらリセット
    if (data.lastUsedAt !== today) {
      await setDoc(ref, {
        ...data,
        freeUsed: false,
        adUsedCount: 0,
        lastUsedAt: today,
      }, { merge: true });
    }
  }
}
