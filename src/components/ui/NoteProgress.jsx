// ------------------------------------------------------
// 🎵 NoteProgress.jsx（7問進行ゲージ＋全音虹アニメ対応）
// ------------------------------------------------------
import React from "react";
import "./NoteProgress.css";

export default function NoteProgress({ current = 0, isRainbow = false }) {
  const notes = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
  return (
    <div
      className={`flex justify-center gap-2 mt-4 mb-6 ${
        isRainbow ? "note-rainbow" : ""
      }`}
    >
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
