// ------------------------------------------------------
// 🎸 src/components/ui/NoteTrackChallenge.jsx（チャレンジ用）
// ------------------------------------------------------
// ・2連音符（♫）でリズミカル演出
// ・満タン時に左右へスパーク＋虹波アニメ
// ------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";

export default function NoteTrackChallenge({ progress = 0, onFull }) {
  const kind = NOTE_KIND.challenge;
  const audioRef = useRef(null);
  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [sparkNotes, setSparkNotes] = useState([]);

  const filled = Math.min(7, Math.floor(progress / 15));
  const wasFullRef = useRef(false);

  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      audioRef.current?.play().catch(() => {});
      onFull?.();

      // ⚡ 左右に飛ぶ音符を4つ生成
      const items = Array.from({ length: 4 }).map((_, i) => ({
        id: `${Date.now()}-${i}`,
        side: i % 2 === 0 ? "left" : "right",
        delay: i * 0.15,
        size: 22 + Math.random() * 10,
        color: ["#ff7eb9", "#ff65a3", "#7afcff", "#feff9c"][i % 4],
        distance: 120 + Math.random() * 60,
      }));
      setSparkNotes(items);

      const t = setTimeout(() => {
        setIsFull(false);
        setSparkNotes([]);
      }, 3500);
      return () => clearTimeout(t);
    }
    wasFullRef.current = nowFull;
  }, [filled]);

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
              className="note relative w-10 h-10 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-500 overflow-hidden"
              style={{
                opacity: lit ? 1 : 0.5,
                transform: lit ? "scale(1.05)" : "scale(0.9)",
                background: lit
                  ? "linear-gradient(135deg, #ff7eb9, #ff65a3, #7afcff)"
                  : "linear-gradient(180deg,#eee,#bbb)",
                boxShadow: lit
                  ? "0 0 16px rgba(255,255,255,0.8)"
                  : "none",
              }}
            >
              <span className="relative z-10 text-xl text-white">♫</span>

              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {filled < 7
          ? `チャレンジ進行：${filled}/7音`
          : "⚡ チャレンジ完了！バトルアイテムGET!"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />

      {/* ⚡ スパークする音符 */}
      {sparkNotes.map((n) => (
        <span
          key={n.id}
          style={{
            position: "absolute",
            bottom: "55%",
            left: "50%",
            fontSize: `${n.size}px`,
            color: n.color,
            opacity: 0,
            animation: `spark${n.side === "left" ? "L" : "R"} ${
              2.8 + Math.random() * 0.3
            }s ease-out ${n.delay}s forwards`,
          }}
        >
          ♫
        </span>
      ))}

      {/* 内部スタイル */}
      <style>{`
        /* 波アニメーション */
        .note .wave {
          background: linear-gradient(270deg,
            #ff7eb9, #ff65a3, #7afcff, #feff9c, #ff7eb9);
          background-size: 400% 400%;
          opacity: 0;
        }

        .is-full .note .wave {
          animation: challengeWave 3200ms ease-in-out 1 both;
        }

        @keyframes challengeWave {
          0%   { background-position: 0% 50%;   opacity: 0.2; }
          25%  { background-position: 25% 50%;  opacity: 0.8; }
          50%  { background-position: 100% 50%; opacity: 1.0; }
          75%  { background-position: 50% 50%;  opacity: 0.6; }
          100% { background-position: 0% 50%;   opacity: 0; }
        }

        /* 左右にスパーク */
        @keyframes sparkL {
          0%   { transform: translate(0,0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          80%  { transform: translate(-120px, -120px) rotate(-30deg) scale(1.3); opacity: 0.9; }
          100% { transform: translate(-180px, -160px) scale(1.1); opacity: 0; }
        }

        @keyframes sparkR {
          0%   { transform: translate(0,0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          80%  { transform: translate(120px, -120px) rotate(30deg) scale(1.3); opacity: 0.9; }
          100% { transform: translate(180px, -160px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
