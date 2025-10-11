// ------------------------------------------------------
// 🌈 src/components/ui/NoteTrackLogin.jsx（常時虹流れVer.）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";

export default function NoteTrackLogin({ progress = 0, onFull }) {
  const kind = NOTE_KIND.login;
  const audioRef = useRef(null);
  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);

  const filled = Math.min(7, Math.floor(progress / 15)); // 1音 = 15%
  const wasFullRef = useRef(false);

  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      audioRef.current?.play().catch(() => {});
      onFull?.();

      const t = setTimeout(() => setIsFull(false), 4000);
      return () => clearTimeout(t);
    }
    wasFullRef.current = nowFull;
  }, [filled, onFull]);

  return (
    <div className="flex flex-col items-center gap-3 select-none relative">
      <div
        className={`relative flex gap-4 p-4 rounded-2xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-12 h-12 flex justify-center items-center rounded-full border-2 border-white shadow-lg text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.3,
                transform: lit ? "scale(1)" : "scale(0.9)",
                boxShadow: lit
                  ? "0 0 16px rgba(255,255,255,0.8)"
                  : "none",
                backgroundImage: lit
                  ? kind.gradient
                  : "linear-gradient(180deg,#ddd,#999)",
                backgroundSize: "400% 400%",
              }}
            >
              <span className="relative z-20 text-3xl">𝄞</span>

              {/* 🌈 常時虹の流れ（点灯中のみ） */}
              {lit && (
                <span
                  className="rainbowFlow absolute inset-0 rounded-full opacity-50"
                  style={{ animationDelay: `${i * 80}ms` }}
                />
              )}

              {/* 💥 満タン時の強波 */}
              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full z-10"
                  style={{
                    animationDelay: `${i * 120}ms`,
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

      <style>{`
        /* 🌈 常時やさしい虹の流れ */
        .note .rainbowFlow {
          background: linear-gradient(
            270deg,
            #ff3b3b, #fbbf24, #34d399, #60a5fa,
            #a78bfa, #ec4899, #facc15, #ff3b3b
          );
          background-size: 400% 400%;
          animation: gentleFlow 6s linear infinite;
        }

        @keyframes gentleFlow {
          0%   { background-position: 0% 50%; opacity: 0.4; }
          50%  { background-position: 100% 50%; opacity: 0.6; }
          100% { background-position: 0% 50%; opacity: 0.4; }
        }

        /* 💥 満タン時の輝き波 */
        .note .wave {
          background: linear-gradient(
            270deg,
            #ff3b3b, #fbbf24, #34d399, #60a5fa,
            #a78bfa, #ec4899, #facc15, #ff3b3b
          );
          background-size: 400% 400%;
          opacity: 0;
          animation: none;
        }

        .is-full .note .wave {
          animation-name: rainbowPulse;
          animation-duration: 3800ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: 1;
          animation-fill-mode: both;
        }

        @keyframes rainbowPulse {
          0%   { background-position: 0% 50%;   opacity: 0.2; filter: brightness(1.0); }
          25%  { background-position: 25% 50%;  opacity: 0.8; filter: brightness(1.2); }
          50%  { background-position: 100% 50%; opacity: 1.0; filter: brightness(1.4); }
          75%  { background-position: 50% 50%;  opacity: 0.8; filter: brightness(1.2); }
          100% { background-position: 0% 50%;   opacity: 0.0; filter: brightness(1.0); }
        }
      `}</style>
    </div>
  );
}
