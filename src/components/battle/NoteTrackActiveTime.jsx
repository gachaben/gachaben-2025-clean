// ------------------------------------------------------
// 🎵 NoteTrackActiveTime.jsx（v3.0）
// 丸付き音符＋波うちカラー演出（ドレミ非表示対応）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function NoteTrackActiveTime({
  progress = 0,        // 0〜7
  showLabels = true,   // ドレミ名を表示するか
}) {
  // 各音符のカラー波パターン
  const COLORS = [
    "#f472b6", // ピンク
    "#fb7185", // ローズ
    "#f59e0b", // アンバー
    "#60a5fa", // ブルー
    "#34d399", // グリーン
    "#a78bfa", // バイオレット
    "#facc15", // イエロー
  ];

  return (
    <div className="flex flex-col items-center select-none">
      {/* 音符ゲージ */}
      <div className="flex space-x-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const active = progress >= i;
          const color = COLORS[(i - 1) % COLORS.length];

          return (
            <motion.div
              key={i}
              animate={{
                scale: active ? [1, 1.15, 1] : 1,
                opacity: active ? 1 : 0.3,
              }}
              transition={{
                duration: 1.2,
                repeat: active ? Infinity : 0,
                ease: "easeInOut",
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold ${
                active ? "shadow-lg" : ""
              }`}
              style={{
                background: active ? color : "#e5e7eb",
                color: active ? "#fff" : "#9ca3af",
              }}
            >
              ♪
            </motion.div>
          );
        })}
      </div>

      {/* ドレミファソラシド表記（任意表示） */}
      {showLabels && (
        <div className="text-xs text-gray-400 mt-2 tracking-wide">
          ド レ ミ ファ ソ ラ シ ド
        </div>
      )}
    </div>
  );
}
