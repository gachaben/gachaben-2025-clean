// ------------------------------------------------------
// 🎵 firestoreStreak.js（週リズム連続正解システム）
// ------------------------------------------------------
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ 週番号キーを算出（例：2025-44）
function getWeekKey() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-${week}`;
}

/**
 * 🎵 streakDataをFirestoreに保存
 * @param {boolean} isCorrect - 正解ならtrue、不正解ならfalse
 */
export async function saveUserStreak(isCorrect) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn("⚠️ saveUserStreak: 未ログインのためスキップ");
      return;
    }

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
    }

    // 週が変わっていたらリセット
    if (data.lastWeekKey !== weekKey) {
      data.currentCorrectStreak = 0;
      data.bestCorrectStreak = 0;
      data.lastWeekKey = weekKey;
    }

    // 更新処理
    if (isCorrect) {
      data.currentCorrectStreak++;
      if (data.currentCorrectStreak > data.bestCorrectStreak) {
        data.bestCorrectStreak = data.currentCorrectStreak;
      }
    } else {
      data.currentCorrectStreak = 0;
    }

    // Firestore書き込み
    await setDoc(
      ref,
      {
        streakData: {
          ...data,
          lastStreakUpdate: new Date().toISOString(),
        },
      },
      { merge: true }
    );

    console.log("✅ streakData更新:", data);
  } catch (err) {
    console.error("❌ saveUserStreak Error:", err);
  }
}
