import React, { useEffect, useRef } from "react";

export default function NoteGauge({ progress = 0, onFull }) {
  const audioRef = useRef(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (progress >= 100 && !hasTriggered.current) {
      hasTriggered.current = true;
      audioRef.current?.play();
      onFull?.();
      // キュイーン＋虹演出をDOMで発火
      const el = document.getElementById("note-gauge");
      el.classList.add("rainbow-burst");
      setTimeout(() => el.classList.remove("rainbow-burst"), 3000);
    }
  }, [progress, onFull]);

  return (
    <div
      id="note-gauge"
      className="relative w-80 h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner"
    >
      <div
        className={`h-full transition-all duration-500 ${
          progress >= 100
            ? "bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400"
            : "bg-gradient-to-r from-blue-400 to-green-400"
        }`}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
      <div className="absolute inset-0 flex justify-center items-center text-sm font-bold text-white drop-shadow">
        {progress.toFixed(0)}%
      </div>

      <audio ref={audioRef} src="/sounds/reward_premium_full.mp3" preload="auto" />
      <style>{`
        .rainbow-burst {
          box-shadow: 0 0 20px 10px rgba(255,255,255,0.6),
                      0 0 60px 30px rgba(255,200,0,0.6),
                      0 0 120px 60px rgba(255,100,150,0.4);
          transition: box-shadow 0.3s ease;
        }
      `}</style>
    </div>
  );
}
