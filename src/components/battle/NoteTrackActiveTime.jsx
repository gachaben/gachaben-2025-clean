// ------------------------------------------------------
// 🎵 src/components/battle/NoteTrackActiveTime.jsx
// ドレミチャレンジバトル用：音符進行ゲージ（7段）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NOTES = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];

export default function NoteTrackActiveTime({ progress = 0 }) {
  const [animateNote, setAnimateNote] = useState(null);

  useEffect(() => {
    if (progress > 0) {
      setAnimateNote(progress - 1);
      const t = setTimeout(() => setAnimateNote(null), 1000);
      return () => clearTimeout(t);
    }
  }, [progress]);

  return (
    <div className="flex flex-col items-center mb-4">
      <div className="flex gap-2 mb-1">
        {NOTES.map((note, idx) => {
          const active = idx < progress;
          const isCurrent = idx === animateNote;
          const color = active
            ? idx === 6
              ? "bg-gradient-to-r from-pink-400 via-yellow-400 to-sky-400"
              : "bg-pink-400"
            : "bg-gray-200";
          return (
            <motion.div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${color}`}
              animate={isCurrent ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.6 }}
            >
              ♪
            </motion.div>
          );
        })}
      </div>

      <div className="flex gap-2 text-xs text-gray-600">
        {NOTES.map((n, i) => (
          <span
            key={i}
            className={i < progress ? "text-pink-500 font-bold" : ""}
          >
            {n}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {progress >= 7 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.1, 1] }}
            exit={{ opacity: 0 }}
            className="mt-3 text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-sky-400"
          >
            🎉 ドレミファソラシド完成！
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
