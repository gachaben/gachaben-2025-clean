// ------------------------------------------------------
// 🎮 src/components/battle/LevelSelect.jsx
// ドレミチャレンジバトル：Lv1〜3 選択UI
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

const LEVELS = [
  { id: 1, label: "Lv1：きほん", color: "from-sky-400 to-cyan-400", reward: "+1音符" },
  { id: 2, label: "Lv2：ふつう", color: "from-amber-400 to-yellow-400", reward: "+2音符" },
  { id: 3, label: "Lv3：チャレンジ", color: "from-pink-400 to-rose-400", reward: "+3音符" },
];

export default function LevelSelect({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-8">
      <p className="text-lg font-bold text-gray-700 mb-2">挑戦するレベルをえらぼう！</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {LEVELS.map((lv) => (
          <motion.button
            key={lv.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(lv.id)}
            className={`w-full py-3 rounded-xl text-white font-bold shadow-md bg-gradient-to-r ${lv.color}`}
          >
            {lv.label}
            <div className="text-sm font-normal opacity-90">{lv.reward}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
