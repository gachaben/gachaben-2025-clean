// ------------------------------------------------------
// 🎵 updateDoremiPoints.js（v3.1 RankUpModal対応版・整形済）
// ------------------------------------------------------
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit";

/**
 * 🎵 ドレミポイントを加算し、称号ランクを更新
 * @param {string} uid - ユーザーID
 * @param {number} add - 加算ポイント
 * @returns {object|null} { points, rank, prevRank } or null
 */
export async function updateDoremiPoints(uid, add) {
  try {
    if (!uid || typeof add !== "number") {
      console.warn("⚠️ updateDoremiPoints: 無効な引数", { uid, add });
      return null;
    }

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    let prevPoints = 0;
    let prevRank = "リコーダー";

    if (snap.exists()) {
      const data = snap.data();
      prevPoints = data.doremiPoints ?? 0;
      prevRank = data.doremiRank ?? "リコーダー";
    }

    // 🔢 新ポイント計算
    const newPoints = prevPoints + add;

    // 🎹 ランク判定
    let newRank = "リコーダー";
    if (newPoints >= 50) newRank = "オルガン";
    if (newPoints >= 100) newRank = "ピアノ";
    if (newPoints >= 200) newRank = "シンセサイザー";
    if (newPoints >= 300) newRank = "グランドマイスター";

    // 📝 Firestore更新（mergeで安全に反映）
    await setDoc(
      ref,
      {
        doremiPoints: newPoints,
        doremiRank: newRank,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(
      `✅ updateDoremiPoints: ${prevPoints} → ${newPoints}pt | ${prevRank} → ${newRank}`
    );

    // 🎯 RankUpModal用データを返す
    return { points: newPoints, rank: newRank, prevRank };
  } catch (e) {
    console.error("❌ updateDoremiPoints失敗:", e);
    return null;
  }
}
