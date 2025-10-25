// ------------------------------------------------------
// 🎥 AdRewardModal.jsx（最終安定版）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";

// ※ useRewardFx は未定義エラー防止のため一時無効化
// import { useRewardFx } from "@/hooks/useRewardFx";

export default function AdRewardModal({ open, onClose, onReward }) {
  // const { triggerHeart } = useRewardFx(); // ← 将来のハート演出用
  const triggerHeart = () => console.log("💖 ハート演出（ダミー）");

  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState("playing");
  const rewardedRef = useRef(false);

  // ✅ モーダル開いた時の初期化
  useEffect(() => {
    if (!open) return;
    console.log("🎥 Ad started");
    setPhase("playing");
    setCountdown(3);
    rewardedRef.current = false;
  }, [open]);

  // ✅ カウントダウン処理
  useEffect(() => {
    if (!open || phase !== "playing") return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }

    // ✅ 完了処理
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      setPhase("done");
      triggerHeart();
      onReward?.();
      setTimeout(() => setPhase("done-hold"), 2500);
    }
  }, [open, phase, countdown, onReward]);

  // ✅ 開いていない時は描画しない
  if (!open) return null;

  // ✅ 表示部（透明ブロック削除済）
  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-[320px] p-5 text-center"
        style={{ pointerEvents: "auto", zIndex: 2147483647 }}
      >
        {phase === "playing" && (
          <>
            <p className="text-lg font-bold mb-2">広告を視聴中…</p>
            <div className="text-3xl font-mono mb-4">{countdown} 秒</div>
            <div className="w-full h-40 bg-gray-200 animate-pulse rounded-lg mb-4 flex items-center justify-center">
              🎬 広告動画風エリア
            </div>
            <button
              disabled
              className="w-full py-2 rounded-lg border opacity-60 cursor-not-allowed"
            >
              Skipできません
            </button>
          </>
        )}

        {(phase === "done" || phase === "done-hold") && (
          <>
            <p className="text-xl font-bold text-green-600 mb-3">視聴完了！</p>
            <p className="text-gray-700 mb-4">ハートが全回復しました💖</p>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-600"
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
