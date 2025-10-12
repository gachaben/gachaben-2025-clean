// ------------------------------------------------------
// 🎵 src/components/ui/NoteTrackBattle.jsx（v2.0）
// バトル用音符ゲージ：赤〜金の炎アニメ＋虹飛翔
// ------------------------------------------------------
import React, { useEffect, useState, useRef } from "react";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackBattle({ progress = 0, onFull }) {
  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const filled = Math.min(7, progress);
  const wasFullRef = useRef(false);

  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      setShowRainbow(true);
      onFull?.();
      const t = setTimeout(() => {
        setIsFull(false);
        setShowRainbow(false);
      }, 4200);
      wasFullRef.current = true;
      return () => clearTimeout(t);
    }
    if (wasFullRef.current && !nowFull) wasFullRef.current = false;
  }, [filled, onFull]);

  const colors = [
    "#ff4b4b", "#ff884b", "#ffcd4b",
    "#ff884b", "#ff4b4b", "#ffcd4b", "#ff884b",
  ];

  return (
    <div
      className="flex flex-col items-center gap-3 select-none relative overflow-visible z-[9999]"
      style={{ marginTop: "10px" }}
    >
      {/* 🎵 ゲージ本体 */}
      <div
        className={`relative flex gap-3 p-3 rounded-xl bg-white/30 backdrop-blur-md shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {colors.map((color, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-11 h-11 flex justify-center items-center rounded-full border border-white shadow-lg text-white font-bold overflow-hidden transition-all duration-700"
              style={{
                opacity: lit ? 1 : 0.35,
                transform: lit ? "scale(1)" : "scale(0.9)",
                backgroundColor: lit ? color : "#d1d5db",
                boxShadow: lit ? `0 0 16px ${color}, 0 0 24px ${color}55` : "none",
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
        <div className="absolute -top-8 left-0 right-0 flex justify-center">
          <NoteFlyRainbow trigger={showRainbow} />
        </div>
      )}

      <style>{`
        /* 🔥 炎の波アニメーション */
        .note .wave {
          background: radial-gradient(circle, #ffeb3b66, #ff5722aa, #e91e63aa);
          opacity: 0;
          animation: none;
        }
        .is-full .note .wave {
          animation: flameWave 4200ms ease-in-out 1 both;
        }
        @keyframes flameWave {
          0%   { opacity: 0.2; transform: scale(1); }
          25%  { opacity: 0.8; transform: scale(1.2); }
          50%  { opacity: 1; transform: scale(1.4); }
          75%  { opacity: 0.6; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
