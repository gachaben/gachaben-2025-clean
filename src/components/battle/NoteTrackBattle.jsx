import React from "react";

export default function NoteTrackBattle({ history = [], total = 7 }) {
  return (
    <div className="flex flex-col items-center mb-4">
      {/* ラベル（ドレミファソラシド） */}
      <div className="flex gap-1 text-xs text-gray-500 mb-1 select-none">
        {["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"].slice(0, total).map((n, i) => (
          <span key={i} style={{ width: 20 }} className="text-center">{n}</span>
        ))}
      </div>

      {/* ノートトラック（履歴反映） */}
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const state = history[i]; // 'correct' or 'wrong' or undefined
          let color = "#f0f0f0"; // 未挑戦
          if (state === "correct") color = "#facc15"; // 金
          else if (state === "wrong") color = "#d1d5db"; // グレー

          return (
            <div
              key={i}
              className="w-6 h-6 rounded-full shadow-sm"
              style={{
                backgroundColor: color,
                border: "1px solid rgba(0,0,0,0.1)",
                transition: "background-color 0.3s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
