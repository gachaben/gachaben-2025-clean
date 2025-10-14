// ------------------------------------------------------
// 🎵 NoteProgress.jsx（7問進行ゲージ）
// ------------------------------------------------------
import React from "react";

export default function NoteProgress({ current }) {
  const notes = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
  return (
    <div className="flex justify-center gap-2 mt-4 mb-6">
      {notes.map((n, i) => (
        <span
          key={i}
          className={`text-2xl font-bold transition-all duration-300 ${
            i < current ? "text-pink-500 scale-110" : "text-gray-300"
          }`}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
