// ------------------------------------------------------
// 🥇 src/components/ui/NoteTrackBattle.jsx
// バトル音符ゲージ（赤〜金・炎のゆらめき風＋虹音符飛翔）
// ------------------------------------------------------

import React, { useEffect, useState, useRef } from "react";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackBattle({ progress = 0, onFull }) {
  console.log("✅ NoteTrackBattle loaded");

  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const filled = Math.min(7, Math.floor(progress / 15));
  const wasFullRef = useRef(false);

  useEffect(() => {
    const nowFull = filled >= 7;

    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      setShowRainbow(true); // 🌈 虹を表示

      // ✅ onFullは「一度だけ」発火
      if (onFull) onFull();

      const t = setTimeout(() => {
        setIsFull(false);
        setShowRainbow(false);
      }, 4000);

      wasFullRef.current = true; // ← フラグON
      return () => clearTimeout(t);
    }

    // ✅ 満タン解除時にリセット（再発火できるように）
    if (wasFullRef.current && !nowFull) {
      wasFullRef.current = false;
    }
  }, [filled]);

  const colors = [
    "#ff4b4b", // 赤
    "#ff884b", // オレンジ
    "#ffcd4b", // 金
    "#ff884b", // オレンジ
    "#ff4b4b", // 赤
    "#ffcd4b", // 金
    "#ff884b", // オレンジ
  ];

  return (
    <div className="flex flex-col items-center gap-3 select-none relative overflow-visible">
      {/* 🎵 ゲージ本体 */}
      <div
        className={`relative flex gap-4 p-4 rounded-2xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {colors.map((color, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-12 h-12 flex justify-center items-center rounded-full border-2 border-white shadow-lg text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.3,
                transform: lit ? "scale(1)" : "scale(0.9)",
                backgroundColor: lit ? color : "#ccc",
                boxShadow: lit
                  ? `0 0 16px ${color}, 0 0 32px ${color}55`
                  : "none",
              }}
            >
              <span className="relative z-10 text-2xl">♬</span>
              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full"
                  style={{
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 🌈 虹音符（MAX時） */}
      {showRainbow && (
        <div className="absolute top-[-20px]">
          <NoteFlyRainbow trigger={showRainbow} />
        </div>
      )}

      {/* テキスト */}
      <p className="text-sm mt-2 text-gray-700 font-medium">
        {filled < 7 ? `進行：${filled}/7` : "🔥 バトルゲージMAX！"}
      </p>

      {/* 🔥 炎アニメーション */}
      <style>{`
        .note .wave {
          background: radial-gradient(circle, #ffeb3b55, #ff5722aa, #e91e63aa);
          opacity: 0;
          animation: none;
        }
        .is-full .note .wave {
          animation: flameWave 4000ms ease-in-out 1 both;
        }
        @keyframes flameWave {
          0% { opacity: 0.2; transform: scale(1); }
          25% { opacity: 0.8; transform: scale(1.2); }
          50% { opacity: 1; transform: scale(1.4); }
          75% { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
