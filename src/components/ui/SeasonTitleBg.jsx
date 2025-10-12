// ------------------------------------------------------
// 🎵 SeasonTitleBg.jsx（Ver.9：単色パステル＋音符種類ミックス）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function SeasonTitleBg({ themeIcon, themeName }) {
  // 🎶 音符の種類を複数用意（Windows環境でも全部表示される組）
  const notes = ["♪", "♪", "♩", "♫"];
  // 🌈 7色の単色パステルカラー（ゲージと対応）
  const colors = [
    "#ff7878", // 赤
    "#ffae50", // オレンジ
    "#ffdc64", // 黄
    "#78dc78", // 緑
    "#78c8ff", // 水色
    "#a08cff", // 青紫
    "#e696ff", // ピンクパープル
  ];

  const numNotes = 25;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: numNotes }).map((_, i) => {
        const note = notes[Math.floor(Math.random() * notes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startX = Math.random() * window.innerWidth;
        const duration = 18 + Math.random() * 10;

        return (
          <motion.div
            key={i}
            className="absolute text-3xl md:text-4xl"
            initial={{
              x: startX,
              y: "100vh",
              opacity: 0,
              scale: 0.8 + Math.random() * 0.4,
            }}
            animate={{
              y: ["100vh", "-10vh"],
              opacity: [0.4, 0.9, 0.4],
              x: [startX, startX + Math.random() * 100 - 50],
            }}
            transition={{
              duration,
              delay: Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              color, // 🎨 単色で塗る
              textShadow: `0 0 10px ${color}70`, // やわらか光
              filter: "blur(0.2px)",
            }}
          >
            {note}
          </motion.div>
        );
      })}

      <div className="absolute bottom-4 w-full text-center text-sm md:text-base text-gray-600/70 font-semibold pointer-events-auto drop-shadow-sm">
        {themeIcon} 今月は「{themeName}」シーズン中♪
      </div>
    </div>
  );
}
