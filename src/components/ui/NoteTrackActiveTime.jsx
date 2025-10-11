// ------------------------------------------------------
// ♬ src/components/ui/NoteTrackActiveTime.jsx
// バトル用ドレミファソラシドゲージ（♬表示・非固定＋安全zIndex）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function NoteTrackActiveTime({ progress = 0 }) {
  const total = 7;
  const labels = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      style={{
        zIndex: 10, // 🎵 カードより下
        pointerEvents: "none", // 🎵 クリックを通す
      }}
    >
      {/* ♬ ゲージ */}
      <div className="flex gap-3 justify-center">
        {Array.from({ length: total }).map((_, i) => {
          const active = i < progress;
          return (
            <motion.span
              key={i}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{
                scale: active ? 1.25 : 0.9,
                opacity: active ? 1 : 0.45,
                rotate: active ? [0, -6, 6, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
              className="text-3xl leading-none"
              style={{ color: active ? "#fb7185" : "#d1d5db" }}
              aria-hidden="true"
            >
              ♬
            </motion.span>
          );
        })}
      </div>

      {/* ドレミファソラシド ラベル */}
      <div className="flex gap-3 text-sm mt-1">
        {labels.map((lab, i) => (
          <span
            key={lab}
            className={i < progress ? "text-pink-500 font-bold" : "text-gray-400"}
          >
            {lab}
          </span>
        ))}
      </div>
    </div>
  );
}
