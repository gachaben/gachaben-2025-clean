// ------------------------------------------------------
// 🎴 CardBar.jsx（v1.4）
// ドレミチャレンジ用：カード3回制限＋復活除外
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CARD_INFO = [
  { id: "cut", label: "🧠 選択肢カット" },
  { id: "extend", label: "⏰ 時間延長" },
  { id: "reroll", label: "🔄 チェンジ" },
  { id: "boost", label: "🌟 ブースト" },
  { id: "revive", label: "❤️ 復活" },
];

export default function CardBar({ cardsLeft = 3, usedCards = {}, onUse }) {
  const isLocked = cardsLeft <= 0;

  return (
    <div className="flex flex-wrap justify-center gap-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl shadow-md border border-gray-200 w-[95%] max-w-md">
      {CARD_INFO.map((card) => {
        const usedCount = usedCards[card.id] || 0;
        const disabled =
          (isLocked && card.id !== "revive") || // 残回数0なら使用不可
          (card.id !== "revive" && usedCount > 0); // 各カード1回まで

        return (
          <motion.div
            key={card.id}
            whileTap={{ scale: disabled ? 1 : 0.9 }}
            className="flex flex-col items-center"
          >
            <Button
              disabled={disabled}
              onClick={() => onUse && onUse(card.id)}
              className={`text-xs px-3 py-1.5 rounded-xl border font-semibold shadow-sm transition-all ${
                disabled
                  ? "bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-300 to-yellow-300 text-white border-none hover:opacity-90"
              }`}
            >
              {card.label}
            </Button>
            {card.id !== "revive" && (
              <span className="text-[10px] text-gray-600 mt-1">
                {usedCount > 0 ? "使用済" : ""}
              </span>
            )}
          </motion.div>
        );
      })}

      {/* 残り使用回数表示 */}
      <div className="text-xs text-gray-700 font-semibold mt-2 w-full text-center">
        カード残り：{cardsLeft} / 3
      </div>
    </div>
  );
}
