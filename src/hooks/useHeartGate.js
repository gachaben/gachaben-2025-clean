// ------------------------------------------------------
// 💖 useHeartGate.js（v2.2 完全版）
// Firebase Emulator対応・ハート消費／広告回復統合
// ------------------------------------------------------

import { useState, useCallback } from "react";
import { useHearts } from "@/context/HeartsContext";

/**
 * ハート制限アクションを管理するフック。
 * 0なら広告誘導を開き、OKなら処理実行。
 * 
 * 使い方例：
 * const { startWithHeart, adOpen, closeAd, watchAd } =
 *     useHeartGate({ onProceed: playBattle });
 */
export default function useHeartGate({ onProceed }) {
  const { consumeHeart, recoverHearts } = useHearts();
  const [adOpen, setAdOpen] = useState(false);
  const [pending, setPending] = useState(false);

  // 🎮 アクション開始時にハートを1消費
  const startWithHeart = useCallback(async () => {
    if (pending) return; // 二重実行防止
    setPending(true);

    try {
      const ok = await consumeHeart();
      if (!ok) {
        console.warn("💔 ハート不足 → 広告誘導モーダルを開きます");
        setAdOpen(true);
        return;
      }
      console.log("❤️ ハート消費完了 → メイン処理へ");
      await onProceed?.();
    } catch (e) {
      console.error("❌ useHeartGate.startWithHeart 失敗:", e);
    } finally {
      setPending(false);
    }
  }, [consumeHeart, onProceed, pending]);

  // 🎬 広告視聴で全回復（2.5秒演出）
  const watchAd = useCallback(async () => {
    try {
      console.log("🎥 広告視聴 → ハート全回復を実行");
      await recoverHearts();

      // 💖 見せ場の演出を2.5秒残す
      setTimeout(() => {
        setAdOpen(false);
      }, 2500);
    } catch (e) {
      console.error("❌ useHeartGate.watchAd 失敗:", e);
    }
  }, [recoverHearts]);

  const closeAd = useCallback(() => setAdOpen(false), []);

  return {
    startWithHeart, // アクション開始（ハート消費）
    adOpen,         // 広告モーダル表示状態
    closeAd,        // モーダル閉じる
    watchAd,        // 広告視聴で回復
    pending,        // 実行中状態
  };
}
