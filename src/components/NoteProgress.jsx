// ------------------------------------------------------
// 🎵 NoteProgress.jsx（v2.0 / 正解時のみ点灯）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function NoteProgress({ current = 0, total = 7, isRainbow = false }) {
  const notes = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];

  return (
    <div className="flex gap-2 mb-6 justify-center">
      {notes.slice(0, total).map((note, i) => {
        const isActive = i < current; // ✅ 現在の正解数より小さい番号だけ点灯
        return (
          <motion.div
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isActive
                ? isRainbow
                  ? "bg-gradient-to-r from-pink-400 to-yellow-400 text-white shadow-lg"
                  : "bg-yellow-300 text-white shadow-md"
                : "bg-gray-200 text-gray-400"
            }`}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: isActive ? 1.2 : 1, opacity: isActive ? 1 : 0.6 }}
            transition={{ duration: 0.3 }}
          >
            {note}
          </motion.div>
        );
      })}
    </div>
  );
}
