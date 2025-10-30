// ------------------------------------------------------
// 🎵 NoteTrackBattle.jsx（7音進行ゲージ）
// ------------------------------------------------------
import React from "react";

const labels = ["ド","レ","ミ","ファ","ソ","ラ","シ","ド"];

export default function NoteTrackBattle({ progress = 0, victoryAt = 4 }) {
  // progress: 現バトルでの点灯数（0〜7）
  return (
    <div className="flex items-end gap-2 select-none">
      {labels.map((n, i) => {
        const lit = i < progress;
        const isVictory = i === victoryAt - 1;
        return (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`w-6 rounded-lg transition-all duration-300 ${
                lit ? "bg-yellow-400" : "bg-white/60"
              }`}
              style={{
                height: 18 + i * 8,
                boxShadow: lit ? "0 0 10px rgba(255,200,0,.8)" : "none",
              }}
              title={`${labels[i]}${isVictory ? "（ここで勝利）" : ""}`}
            />
            <div
              className={`text-[10px] mt-1 ${isVictory ? "font-bold text-pink-600" : "text-gray-600"}`}
            >
              {labels[i]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
