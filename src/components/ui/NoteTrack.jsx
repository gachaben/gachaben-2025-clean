import React, { useEffect, useRef, useState } from "react";
import { NOTE_KIND } from "@/constants/noteKinds";

export default function NoteTrack({ progress = 0, onFull, type = "study" }) {
  const kind = NOTE_KIND[type] || NOTE_KIND.study;
  const audioRef = useRef(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const rainbowRef = useRef(null);
  const filled = Math.floor(progress / 15);

  // 満タン時：音＋虹の波
  useEffect(() => {
    if (filled >= 7 && unlocked && !showRainbow) {
      audioRef.current?.play();
      onFull?.();
      setShowRainbow(true);

      // 強制リペイント（確実にCSSアニメーションを再生）
      if (rainbowRef.current) {
        rainbowRef.current.style.animation = "none";
        // eslint-disable-next-line no-unused-expressions
        rainbowRef.current.offsetHeight; // ← これが再生リセットのトリガー！
        rainbowRef.current.style.animation = "rainbowFlow 4s linear infinite";
      }

      const timer = setTimeout(() => setShowRainbow(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [filled, unlocked, onFull, showRainbow]);

  // CSS注入
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes rainbowFlow {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const noteColors = [
    "#f87171", "#fbbf24", "#34d399",
    "#60a5fa", "#a78bfa", "#f472b6", "#facc15",
  ];

  return (
    <div
      className="flex flex-col items-center gap-3 select-none relative"
      onClick={() => setUnlocked(true)}
    >
      <div className="relative flex gap-3 p-3 rounded-xl bg-white/30 backdrop-blur-md overflow-hidden shadow-inner">
        {/* 🌈 虹レイヤー（zIndex:上＋blur強調） */}
        {showRainbow && (
          <div
            ref={rainbowRef}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "12px",
              background:
                "linear-gradient(270deg, red, orange, yellow, green, cyan, blue, violet, red)",
              backgroundSize: "600% 600%",
              animation: "rainbowFlow 4s linear infinite",
              filter: "blur(10px) brightness(1.5)",
              opacity: 0.8,
              zIndex: 15,
              pointerEvents: "none",
              willChange: "background-position",
            }}
          />
        )}

        {noteColors.map((color, i) => {
          const isLit = i < filled;
          return (
            <div
              key={i}
              className="relative z-20 w-9 h-9 flex justify-center items-center rounded-full border-2 border-white shadow-md text-white font-bold transition-all duration-700"
              style={{
                backgroundColor: isLit ? color : "#e5e7eb",
                boxShadow: isLit
                  ? `0 0 10px ${color}, 0 0 25px ${color}66`
                  : "none",
                opacity: isLit ? 1 : 0.5,
                transform: isLit ? "scale(1.1)" : "scale(0.9)",
              }}
            >
              <span>♪</span>
            </div>
          );
        })}
      </div>

      <p className="text-sm mt-2 text-gray-700 font-medium">
        {unlocked
          ? filled < 7
            ? `進行：${filled}/7音`
            : "🌈 ドレミファソラシド完成！"
          : "👆 画面をタップして音を解禁"}
      </p>

      <audio src={kind.sound} ref={audioRef} preload="auto" />
    </div>
  );
}
