// ------------------------------------------------------
// 🎥 AdRewardModal.jsx（v1.2 / 最終安定版・安全構成）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";

// ⚙️ まだ未定義なので一旦コメントアウト（将来的にハート演出で復帰）
// import { useRewardFx } from "@/hooks/useRewardFx";

export default function AdRewardModal({ open, onClose, onReward }) {
  // const { triggerHeart } = useRewardFx();
  const triggerHeart = () => console.log("💖 ハート演出（ダミー発火）");

  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState("playing");
  const rewardedRef = useRef(false);

  // ✅ モーダル開いたら初期化
  useEffect(() => {
    if (!open) return;
    console.log("🎥 Ad started");
    setPhase("playing");
    setCountdown(3);
    rewardedRef.current = false;
  }, [open]);

  // ✅ カウントダウン → 完了処理
  useEffect(() => {
    if (!open || phase !== "playing") return;

    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }

    // ✅ 視聴完了時
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      setPhase("done");
      triggerHeart();
      onReward?.(); // DP加算 or 再挑戦
      setTimeout(() => setPhase("done-hold"), 2500);
    }
  }, [open, phase, countdown, onReward]);

  if (!open) return null;

  // ✅ 表示UI
  return (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-[320px] p-5 text-center"
        style={{ pointerEvents: "auto", zIndex: 2147483647 }}
      >
        {/* 🎬 再生中フェーズ */}
        {phase === "playing" && (
          <>
            <p className="text-lg font-bold mb-2 text-gray-700">
              広告を視聴中…
            </p>
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

        {/* 🎉 視聴完了フェーズ */}
        {(phase === "done" || phase === "done-hold") && (
          <>
            <p className="text-xl font-bold text-green-600 mb-3">
              視聴完了！
            </p>
            <p className="text-gray-700 mb-4">
              ハートが全回復しました💖
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-600 transition"
            >
              OK
            </button>
          </>
        )}
      </div>
    </div>
  );
}
