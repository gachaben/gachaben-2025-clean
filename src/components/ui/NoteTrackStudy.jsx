// ------------------------------------------------------
// 🎵 src/components/ui/NoteTrackStudy.jsx（共通エフェクト採用版）
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackStudy({ progress = 0, onFull }) {
  const kind = NOTE_KIND.study;
  const audioRef = useRef(null);

  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);

  const filled = Math.min(7, Math.floor(progress / 15));
  const wasFullRef = useRef(false);

  // 満タン時の演出（1回だけ）
  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      audioRef.current?.play().catch(() => {});
      onFull?.();

      // 3.6秒後に解除（再演出できるように）
      const t = setTimeout(() => setIsFull(false), 3600);
      return () => clearTimeout(t);
    }
    wasFullRef.current = nowFull;
  }, [filled, onFull]);

  return (
    <div className="flex flex-col items-center gap-3 select-none relative overflow-visible">
      <div
        className={`relative flex gap-3 p-4 rounded-2xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner ${
          isFull ? "is-full" : ""
        }`}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-10 h-10 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.4,
                transform: lit ? "scale(1)" : "scale(0.9)",
                background: lit
                  ? "linear-gradient(135deg, #ffd1dc, #b5f7e1, #a7e0ff)"
                  : "linear-gradient(180deg,#eee,#bbb)",
                boxShadow: lit ? "0 0 12px rgba(255,255,255,0.6)" : "none",
              }}
            >
              <span className="relative z-10 text-2xl text-white">♪</span>

              {/* 🌊 満タン時の内部波（柔らかめ） */}
              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {filled < 7 ? `学習進行：${filled}/7音` : "🌸 学習完了 → アイテムガチャ報酬！"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />

      {/* 🌈 満タンで4音符が45°対称に舞い上がる（共通エフェクト） */}
      {isFull && (
        <NoteFlyRainbow
          trigger={isFull}
          startBottom="60%"  // ← ゲージの少し上から飛ぶ
          duration={3200}
          height={180}
          size={28}
        />
      )}

      {/* 内部スタイル：丸の中の波 */}
      <style>{`
        .note .wave {
          background: linear-gradient(270deg,
            #ffd1dc, #b5f7e1, #a7e0ff, #b5f7e1, #ffd1dc);
          background-size: 300% 300%;
          opacity: 0;
          animation: none;
        }

        .is-full .note .wave {
          animation: softWave 3600ms ease-in-out 1 both;
        }

        @keyframes softWave {
          0%   { background-position: 0% 50%;   opacity: 0.2; }
          25%  { background-position: 25% 50%;  opacity: 0.6; }
          50%  { background-position: 100% 50%; opacity: 0.9; }
          75%  { background-position: 50% 50%;  opacity: 0.6; }
          100% { background-position: 0% 50%;   opacity: 0; }
        }
      `}</style>
    </div>
  );
}
