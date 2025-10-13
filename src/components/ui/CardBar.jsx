// ------------------------------------------------------
// 🎴 CardBar.jsx（v1.4対応）
// 最大3枚まで使用可能・クリックで発動
// ------------------------------------------------------

import React from "react";

const CARD_LIST = [
  { id: "cut", name: "選択肢カット", icon: "🧠", desc: "選択肢を1つ減らす" },
  { id: "revive", name: "復活カード", icon: "❤️", desc: "ミスしてもコンボ維持" },
  { id: "boost", name: "スタートブースト", icon: "🌟", desc: "開始時+2pt" },
  { id: "time", name: "時間延長", icon: "⏰", desc: "制限時間+5秒" },
  { id: "change", name: "チェンジ", icon: "🔄", desc: "出題を再抽選" },
];

export default function CardBar({ usedCards, onUseCard }) {
  return (
    <div className="flex justify-center gap-3 mt-3 flex-wrap">
      {CARD_LIST.map((card) => {
        const isUsed = usedCards.includes(card.id);
        const disabled = isUsed || usedCards.length >= 3;
        const opacity = card.id === "revive" ? "opacity-70" : isUsed ? "opacity-40" : "opacity-100";

        return (
          <button
            key={card.id}
            onClick={() => !disabled && onUseCard(card.id)}
            className={`relative px-3 py-2 rounded-2xl bg-white shadow-md border border-gray-200 text-sm transition-all hover:scale-105 ${opacity}`}
            disabled={disabled}
          >
            <div className="text-lg">{card.icon}</div>
            <div className="text-xs font-bold mt-1">{card.name}</div>
            {isUsed && (
              <span className="absolute top-0 right-1 text-xs text-gray-400">✓</span>
            )}
            {card.id === "revive" && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] px-1 rounded">
                自動
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
