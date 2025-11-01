// ------------------------------------------------------
// 🎯 firestoreStreak.js（デバッグ付き）
// ------------------------------------------------------
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

console.log("🔥 firestoreStreak loaded");

function getWeekKey() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-${week}`;
}

export async function saveUserStreak(isCorrect) {
  console.log("🚀 saveUserStreak called:", isCorrect);
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.warn("⚠️ 未ログインのためスキップ");
    return;
  }

  try {
    const db = getFirestore();
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    const weekKey = getWeekKey();

    let data = {
      currentCorrectStreak: 0,
      bestCorrectStreak: 0,
      lastWeekKey: weekKey,
    };

    if (snap.exists()) {
      data = snap.data().streakData || data;
      console.log("📄 Firestoreから既存データ取得:", data);
    }

    if (data.lastWeekKey !== weekKey) {
      data.currentCorrectStreak = 0;
      data.bestCorrectStreak = 0;
      data.lastWeekKey = weekKey;
    }

    if (isCorrect) {
      data.currentCorrectStreak++;
      data.bestCorrectStreak = Math.max(data.bestCorrectStreak, data.currentCorrectStreak);
    } else {
      data.currentCorrectStreak = 0;
    }

    await setDoc(
      ref,
      {
        streakData: {
          ...data,
          lastUpdate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log("🔥 streakData更新:", data);
  } catch (err) {
    console.error("❌ saveUserStreak Error:", err);
  }
}
