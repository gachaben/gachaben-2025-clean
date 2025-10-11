// ------------------------------------------------------
// 🎴 src/components/battle/CardBar.jsx
// ドレミチャレンジバトル：手札UI（カード3枚まで）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function CardBar({ cards = [], onUse }) {
  if (!cards.length) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full flex justify-center">
      <div className="flex gap-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-md border border-gray-200">
        {cards.map((card, idx) => (
          <motion.button
            key={card.id}
            whileHover={!card.used ? { scale: 1.05 } : {}}
            whileTap={!card.used ? { scale: 0.95 } : {}}
            disabled={card.used}
            onClick={() => {
              if (!card.used) onUse(card);
            }}
            className={`relative px-3 py-2 rounded-xl font-bold text-sm text-white shadow-sm ${
              card.used
                ? "bg-gray-400 opacity-60 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-400 to-rose-400"
            }`}
          >
            <span>{card.name}</span>

            {/* 使用済マーク */}
            {card.used && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center font-extrabold text-white text-xs bg-black/30 rounded-xl"
              >
                USED
              </motion.span>
            )}

            {/* ツールチップ風説明 */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 bg-white px-2 py-1 rounded-lg shadow hidden group-hover:block whitespace-nowrap">
              {card.desc}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
