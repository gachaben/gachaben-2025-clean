// ------------------------------------------------------
// 🎵 src/components/ui/NoteTrack.jsx（まっすぐ上昇Ver）
// ------------------------------------------------------
// ✅ 緑・青・紫の3音符が中央付近から真っすぐ上に
// ✅ スピードは5秒（今のテンポのまま）
// ✅ 横揺れなし・ふわふわ感削除・上昇はスーッと静かに
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";

export default function NoteTrack({ progress = 0, onFull, type = "study" }) {
  const kind = NOTE_KIND[type] || NOTE_KIND.study;
  const audioRef = useRef(null);

  const [unlocked, setUnlocked] = useState(false);
  const [waveKey, setWaveKey] = useState(0);
  const [flyNotes, setFlyNotes] = useState([]);
  const filled = Math.min(7, Math.floor(progress / 15));
  const isFull = filled >= 7;

  const prevFullRef = useRef(false);
  useEffect(() => {
    const wasFull = prevFullRef.current;
    if (!wasFull && isFull) {
      setWaveKey((k) => k + 1);
      onFull?.();

      // 🎈 緑・青・紫音符（②③④位置）
      const positions = [35, 50, 65];
      const colors = ["#34d399", "#60a5fa", "#a78bfa"];

      const items = positions.map((x, i) => ({
        id: `${waveKey}-${i}`,
        left: x,
        delay: i * 0.3,
        size: 28 + Math.random() * 10,
        color: colors[i % colors.length],
      }));
      setFlyNotes(items);
      setTimeout(() => setFlyNotes([]), 5500);

      if (unlocked) {
        audioRef.current?.play().catch(() => {});
      }
    }
    prevFullRef.current = isFull;
  }, [isFull, unlocked, onFull]);

  const noteColors = [
    "#f87171", "#fbbf24", "#34d399",
    "#60a5fa", "#a78bfa", "#f472b6", "#facc15",
  ];

  return (
    <div
      className={`flex flex-col items-center gap-3 select-none relative ${
        isFull ? "is-full" : ""
      }`}
      onClick={() => setUnlocked(true)}
    >
      {/* 🎈 飛び出す音符（まっすぐ上昇） */}
      {flyNotes.map((n) => (
        <span
          key={n.id}
          className="absolute"
          style={{
            position: "absolute",
            left: `${n.left}%`,
            bottom: "10%",
            fontSize: `${n.size}px`,
            color: n.color,
            animation: `floatUpStraight 5s ease-in-out ${n.delay}s forwards`,
            opacity: 0.9,
            zIndex: 80,
          }}
        >
          ♪
        </span>
      ))}

      {/* 🌈 音符ゲージ */}
      <div className="relative flex gap-3 p-3 rounded-xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner">
        {noteColors.map((color, i) => {
          const lit = i < filled;
          return (
            <div
              key={i}
              className="note relative w-10 h-10 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                backgroundColor: lit ? color : "#e5e7eb",
                opacity: lit ? 1 : 0.5,
                transform: lit ? "scale(1)" : "scale(0.9)",
                boxShadow: lit
                  ? `0 0 10px ${color}, 0 0 24px ${color}66`
                  : "none",
              }}
            >
              <span className="relative z-10">♪</span>
              {isFull && (
                <span
                  key={`${waveKey}-${i}`}
                  className="wave absolute inset-0 rounded-full pointer-events-none"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {unlocked
          ? filled < 7
            ? `進行：${filled}/7音`
            : "🌈 ドレミファソラシド完成！"
          : "👆 画面をタップして音を解禁（波・音符演出あり）"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />

      <style>{`
        /* 🌈 波アニメーション */
        .note .wave {
          background-image: linear-gradient(270deg,
            #ff3b3b, #fbbf24, #34d399, #60a5fa,
            #a78bfa, #ec4899, #facc15, #ff3b3b);
          background-size: 400% 400%;
          mix-blend-mode: overlay;
          opacity: 0;
          animation: none;
        }

        .is-full .note .wave {
          animation-name: noteWaveMove;
          animation-duration: 4400ms;
          animation-timing-function: ease-in-out;
          animation-iteration-count: 1;
          animation-fill-mode: both;
        }

        @keyframes noteWaveMove {
          0%   { background-position: 0% 50%;   opacity: 0.2; filter: brightness(1.0); }
          20%  { background-position: 25% 50%;  opacity: 0.6; filter: brightness(1.2); }
          50%  { background-position: 100% 50%; opacity: 1.0; filter: brightness(1.3); }
          80%  { background-position: 50% 50%;  opacity: 0.6; filter: brightness(1.15); }
          100% { background-position: 0% 50%;   opacity: 0.0; filter: brightness(1.0); }
        }

        /* 🎈 スーッと真っすぐ上昇 */
        @keyframes floatUpStraight {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateY(-100px) scale(1.05);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-220px) scale(1);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-330px) scale(0.98);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-420px) scale(0.95);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
