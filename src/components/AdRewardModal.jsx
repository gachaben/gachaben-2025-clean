import React, { useEffect, useRef, useState } from "react";

export default function AdRewardModal({ open, onClose, onReward }) {
  const [countdown, setCountdown] = useState(3);
  const [phase, setPhase] = useState("playing"); // "playing" | "done"
  const rewardedRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    // モーダルが開くたびに初期化
    setPhase("playing");
    setCountdown(3);
    rewardedRef.current = false;
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "playing") return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    // 0になったら報酬付与（1回だけ）
    if (!rewardedRef.current) {
      rewardedRef.current = true;
      setPhase("done");
      onReward?.();
    }
  }, [open, phase, countdown, onReward]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[320px] p-5 text-center">
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

        {phase === "done" && (
          <>
            <p className="text-xl font-bold text-green-600 mb-3">視聴完了！</p>
            <p className="text-gray-700 mb-4">ハートが1つ回復しました💖</p>
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
