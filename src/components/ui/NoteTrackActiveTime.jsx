// ------------------------------------------------------
// ⌛ src/components/ui/NoteTrackActiveTime.jsx
// ------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import NoteFlyRainbow from "@/components/ui/effects/NoteFlyRainbow";

export default function NoteTrackActiveTime({ onFull }) {
  const [progress, setProgress] = useState(0);
  const [waveKey, setWaveKey] = useState(0);
  const [isFull, setIsFull] = useState(false);
  const [message, setMessage] = useState("");
  const wasFullRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 105 ? 105 : p + 15));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filled = Math.min(7, Math.floor(progress / 15));
  const chance = Math.min(100, filled * 15);

  useEffect(() => {
    const nowFull = filled >= 7;
    if (!wasFullRef.current && nowFull) {
      setWaveKey((k) => k + 1);
      setIsFull(true);
      onFull?.();
      wasFullRef.current = true;
      const t = setTimeout(() => setIsFull(false), 4000);
      return () => clearTimeout(t);
    }
    if (wasFullRef.current && !nowFull) wasFullRef.current = false;
  }, [filled]);

  const getMessage = (filled) => {
    if (filled <= 1) return "きたー！プレミアムアイテムがあたるかも！";
    if (filled <= 5) return "チャンス！プレミアムアイテムは目の前だ！";
    if (filled === 6) return "激熱！やったね！";
    return "やったー！おめでとう！";
  };

  useEffect(() => {
    if (filled > 0) {
      const msg = getMessage(filled);
      setMessage(msg);
      setVisible(true);
      const show = setInterval(() => {
        setVisible((v) => !v);
      }, 3000);
      return () => clearInterval(show);
    }
  }, [filled]);

  const colors = [
    "#f6c3b8",
    "#f8cfa2",
    "#fae29f",
    "#d2f4b8",
    "#a7ebd1",
    "#a8d8ff",
    "#d6c4ff",
  ];

  return (
    <div className={`flex flex-col items-center gap-3 select-none relative ${isFull ? "is-full" : ""}`}>
      {isFull && <NoteFlyRainbow trigger={isFull} />}

      <div className="relative flex gap-3 p-3 rounded-2xl bg-white/40 backdrop-blur-md overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-yellow-100 to-blue-200 opacity-40 blur-2xl rounded-2xl animate-pulse-slow" />

        {colors.map((color, i) => {
          const lit = i < filled;
          return (
            <div
              key={`${waveKey}-${i}`}
              className="note relative w-10 h-10 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-700 overflow-hidden"
              style={{
                backgroundColor: lit ? color : "#e5e7eb",
                opacity: lit ? 1 : 0.6,
                transform: lit ? "scale(1.1)" : "scale(0.9)",
                boxShadow: lit ? `0 0 12px ${color}, 0 0 28px ${color}77` : "none",
              }}
            >
              <span className="relative z-10 text-2xl">♪</span>
              {isFull && (
                <span
                  key={`${waveKey}-wave-${i}`}
                  className="wave absolute inset-0 rounded-full pointer-events-none"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {visible && message && (
        <div
          className="absolute -top-14 bg-gradient-to-r from-pink-200 via-yellow-200 to-blue-200 text-gray-800 text-sm px-5 py-2 rounded-full shadow-lg border border-white/70"
          style={{ fontFamily: '"Comic Sans MS", "Poppins", cursive', animation: "pop 0.4s ease-out" }}
        >
          {message}
        </div>
      )}

      <button
        className={`mt-2 px-5 py-2 rounded-full text-white text-sm font-semibold shadow-md transition ${
          filled === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-400 to-red-400 hover:scale-105"
        }`}
        disabled={filled === 0}
        onClick={() => alert("🎥 動画再生 → プレミアムガチャ発動！")}
      >
        🎥 動画を見て、プレミアムガチャをひこう♪
      </button>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        ⏳ 稼働時間：{filled * 5}分（{chance}%）
      </p>

      <style>{`
        .note .wave {
          background: radial-gradient(circle, #fff3b0aa, #ffb4a2aa, #e5989baa);
          opacity: 0;
          animation: none;
        }
        .is-full .note .wave {
          animation: gentleWave 4000ms ease-in-out 1 both;
        }
        @keyframes gentleWave {
          0% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes pulse-slow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          30% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
