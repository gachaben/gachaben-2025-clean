// ------------------------------------------------------
// 🌈 src/components/ui/NoteTrackLogin.jsx（七色波動Ver）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackLogin({ progress = 0, onFull }) {
  const kind = NOTE_KIND.login;
  const audioRef = useRef(null);
  const [isFull, setIsFull] = useState(false);
  const [waveKey, setWaveKey] = useState(0);

  const filled = Math.min(7, Math.floor(progress / 15));
  const wasFullRef = useRef(false);

  // 満タン時のみ一度発火
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

  // 🌈 各音符の基本色（7色の虹）
  const rainbowColors = [
    "#ff6666", // 赤
    "#ff9933", // オレンジ
    "#ffcc33", // 黄
    "#66cc66", // 緑
    "#3399ff", // 青
    "#9966ff", // 紫
    "#ff66cc", // ピンク
  ];

  return (
    <div className="flex flex-col items-center gap-3 select-none relative overflow-visible">
      <div
        className={`relative flex gap-4 p-4 rounded-2xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const lit = i < filled;
          const color = rainbowColors[i % rainbowColors.length];
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-12 h-12 flex justify-center items-center rounded-full border-2 border-white shadow-lg text-white font-bold overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.3,
                transform: lit ? "scale(1)" : "scale(0.9)",
                backgroundImage: lit
                  ? `linear-gradient(180deg, ${color}, #fff)`
                  : "linear-gradient(180deg,#ddd,#999)",
                backgroundSize: "400% 400%",
                boxShadow: lit ? `0 0 18px ${color}88` : "none",
              }}
            >
              <span className="relative z-10 text-3xl">𝄞</span>

              {/* 🌊 虹色の波（個別カラーでゆらぐ） */}
              {lit && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className={`wave absolute inset-0 rounded-full ${
                    isFull ? "pulse-strong" : "pulse-soft"
                  }`}
                  style={{
                    "--wave-color": color,
                    animationDelay: `${i * 0.25}s`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {filled < 7
          ? `ログイン進行：${filled}/7日`
          : "🌈 プレミアムガチャ解放！"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />

      {/* 🌈 満タンで4音符が舞う */}
      {isFull && (
        <NoteFlyRainbow
          trigger={isFull}
          startBottom="60%"
          duration={3400}
          height={180}
          size={30}
        />
      )}

      <style>{`
        .note .wave {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: linear-gradient(
            270deg,
            var(--wave-color),
            #ffffff,
            var(--wave-color)
          );
          background-size: 300% 300%;
          opacity: 0.5;
          mix-blend-mode: overlay;
        }

        /* 🌊 ゆるやかに虹が流れる */
        .note .wave.pulse-soft {
          animation: rainbowFlow 5s ease-in-out infinite;
        }

        /* 🌈 満タン時は強く2回光る */
        .note .wave.pulse-strong {
          animation: rainbowBurst 3s ease-in-out 2;
        }

        @keyframes rainbowFlow {
          0%   { background-position: 0% 50%; opacity: 0.45; }
          50%  { background-position: 100% 50%; opacity: 0.8; filter: brightness(1.4); }
          100% { background-position: 0% 50%; opacity: 0.45; filter: brightness(1.1); }
        }

        @keyframes rainbowBurst {
          0%   { background-position: 0% 50%; opacity: 0.6; filter: brightness(1.2); }
          25%  { background-position: 25% 50%; opacity: 1.0; filter: brightness(1.6); }
          50%  { background-position: 100% 50%; opacity: 1.0; filter: brightness(1.8); }
          75%  { background-position: 50% 50%; opacity: 0.8; filter: brightness(1.4); }
          100% { background-position: 0% 50%; opacity: 0.6; filter: brightness(1.1); }
        }
      `}</style>
    </div>
  );
}
