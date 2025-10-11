// ------------------------------------------------------
// 🌱 src/components/ui/NoteTrackChallenge.jsx
// グリーンに黄・赤を少し混ぜた「生命のチャレンジ」トーン
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackChallenge({ progress = 0, onFull }) {
  const kind = NOTE_KIND.challenge;
  const audioRef = useRef(null);
  const [isFull, setIsFull] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const filled = Math.min(7, Math.floor(progress / 15));
  const wasFullRef = useRef(false);

  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setIsFull(true);
      audioRef.current?.play().catch(() => {});
      onFull?.();
      const t = setTimeout(() => setIsFull(false), 4000);
      return () => clearTimeout(t);
    }
    wasFullRef.current = nowFull;
  }, [filled, onFull]);

  // 🌿 緑 × 黄 × 赤のあたたかハーモニー
  const colors = [
    "#65a30d", // 黄緑
    "#84cc16", // 若草
    "#34d399", // エメラルド
    "#f59e0b", // サンイエロー
    "#f87171", // 柔らかい赤（差し色）
  ];

  return (
    <div className="flex flex-col items-center gap-3 select-none relative overflow-visible">
      <div
        className={`relative flex gap-4 p-4 rounded-2xl bg-white/20 backdrop-blur-md overflow-hidden shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const lit = i < filled;
          const color = colors[i % colors.length];
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-12 h-12 flex justify-center items-center rounded-full border border-white/70 shadow-md text-white font-bold overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.35,
                transform: lit ? "scale(1)" : "scale(0.92)",
                backgroundImage: lit
                  ? `linear-gradient(145deg, ${color}, #ffffff33)`
                  : "linear-gradient(145deg,#d1d5db,#9ca3af)",
                boxShadow: lit
                  ? `0 0 14px ${color}77, inset 0 0 6px ${color}44`
                  : "none",
              }}
            >
              <span className="relative z-10 text-2xl text-white drop-shadow-sm">♬</span>

              {lit && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    animationDelay: `${i * 0.25}s`,
                    "--wave-color": color,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {filled < 7
          ? `チャレンジ進行：${filled}/7`
          : "🌼 チャレンジ完了！アイテムガチャ解放！"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />

      {/* 🌈 満タン時に虹音符が舞う */}
      {isFull && (
        <NoteFlyRainbow
          trigger={isFull}
          startBottom="60%"
          duration={3400}
          height={180}
          size={28}
        />
      )}

      <style>{`
        .note .wave {
          background: linear-gradient(
            270deg,
            var(--wave-color),
            #fef9c3,
            var(--wave-color)
          );
          background-size: 180% 180%;
          opacity: 0;
          animation: none;
        }

        /* 🍃 やさしく暖かい波 */
        .note .wave {
          animation: softSunWave 3.2s ease-in-out infinite;
        }

        @keyframes softSunWave {
          0%   { background-position: 0% 50%; opacity: 0.15; filter: brightness(0.95); }
          25%  { background-position: 50% 50%; opacity: 0.4; filter: brightness(1.05); }
          50%  { background-position: 100% 50%; opacity: 0.7; filter: brightness(1.15); }
          75%  { background-position: 50% 50%; opacity: 0.4; filter: brightness(1.05); }
          100% { background-position: 0% 50%; opacity: 0.15; filter: brightness(0.9); }
        }
      `}</style>
    </div>
  );
}
