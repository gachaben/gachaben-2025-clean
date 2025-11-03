// ------------------------------------------------------
// 🎵 updateDoremiPoints.js（v3.2 / DPボーナス・ストリーク対応）
// ------------------------------------------------------
// 目的：バトル・チャレンジ・学習共通でDPと連続正解を管理
// - 勝利・敗北・広告ボーナスすべて統合
// - 称号ランクは廃止（currentStreak のみ維持）
// ------------------------------------------------------

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit";

/**
 * 🎵 ドレミポイント加算ユーティリティ
 * @param {string} uid - ユーザーID
 * @param {number} base - 基本DP（例：勝利10 / 敗北5）
 * @param {object} options
 *   @param {boolean} [options.doubleReward] - 広告視聴でDP2倍
 *   @param {boolean} [options.resetStreak] - 連続正解リセット（敗北時など）
 *   @param {number} [options.bonus] - 追加DP（復活カード等）
 * @returns {object|null} { points, gained, streak } or null
 */
export async function updateDoremiPoints(uid, base = 0, options = {}) {
  try {
    if (!uid) throw new Error("Missing UID in updateDoremiPoints");

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    let prevPoints = 0;
    let prevStreak = 0;

    if (snap.exists()) {
      const data = snap.data();
      prevPoints = data.doremiPoints ?? 0;
      prevStreak = data.currentStreak ?? 0;
    }

    // ✅ DP加算ロジック
    let gained = base;
    if (options.doubleReward) gained *= 2; // 広告ボーナス2倍
    if (options.bonus) gained += options.bonus; // 追加ボーナス

    // ✅ 新しいストリーク
    const newStreak = options.resetStreak ? 0 : prevStreak + 1;

    // ✅ Firestore保存（安全なmerge）
    const newPoints = prevPoints + gained;
    await setDoc(
      ref,
      {
        doremiPoints: newPoints,
        currentStreak: newStreak,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    console.log(
      `🎵 DP更新: ${prevPoints}→${newPoints} (+${gained}) streak:${newStreak}`
    );

    // 🎯 戻り値（UI・結果画面用）
    return { points: newPoints, gained, streak: newStreak };
  } catch (e) {
    console.error("❌ updateDoremiPoints失敗:", e);
    return null;
  }
}

/**
 * 🧹 リセット用（デバッグ・管理画面から）
 */
export async function resetDoremiPoints(uid) {
  try {
    if (!uid) throw new Error("Missing UID in resetDoremiPoints");
    const ref = doc(db, "users", uid);
    await setDoc(
      ref,
      { doremiPoints: 0, currentStreak: 0, updatedAt: new Date() },
      { merge: true }
    );
    console.log(`🧹 DPリセット完了: ${uid}`);
  } catch (e) {
    console.error("❌ resetDoremiPoints失敗:", e);
  }
}
