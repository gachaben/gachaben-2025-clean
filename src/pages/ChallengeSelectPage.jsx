// ------------------------------------------------------
// 🌈 ChallengeSelectPage.jsx（チャレンジ選択画面 / 夕方〜虹）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ChallengeSelectPage() {
  const navigate = useNavigate();

  // 🧠 教科風船リスト
  const subjects = [
    { id: "math", name: "計算チャレンジ", color: "from-yellow-200 to-orange-300", emoji: "🧮" },
    { id: "kanji", name: "漢字チャレンジ", color: "from-pink-200 to-red-300", emoji: "✍️" },
    { id: "science", name: "理科チャレンジ", color: "from-green-200 to-emerald-300", emoji: "🔬" },
    { id: "social", name: "社会チャレンジ", color: "from-blue-200 to-indigo-300", emoji: "🌏" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-orange-100 via-pink-100 to-sky-200 text-center">
      {/* 🌈 背景の虹 */}
      <motion.div
        className="absolute top-10 w-[90%] h-40 bg-gradient-to-r from-red-400 via-yellow-300 to-blue-400 rounded-full opacity-50 blur-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.6 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* 🏷️ タイトル */}
      <motion.h1
        className="text-3xl font-bold text-pink-600 mt-12 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🌈 チャレンジをえらぼう！
      </motion.h1>

      <p className="text-gray-600 mb-6 z-10">
        やりたいドリルをタップして、チャレンジをスタート！
      </p>

      {/* 🎈 教科風船（選択ボタン） */}
      <div className="grid grid-cols-2 gap-6 z-10">
        {subjects.map((s, i) => (
          <motion.button
            key={s.id}
            className={`w-40 h-40 rounded-full bg-gradient-to-b ${s.color} shadow-md text-xl font-bold flex flex-col items-center justify-center hover:scale-105 transition`}
            onClick={() => navigate(`/challenge/play?subject=${s.id}`)}
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-4xl mb-2">{s.emoji}</span>
            <span>{s.name}</span>
          </motion.button>
        ))}
      </div>

      {/* 🌇 下部メッセージ */}
      <motion.p
        className="mt-10 text-sm text-gray-700 italic z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        「🌈　がんばって　にじを　見よう　🌈」
      </motion.p>

      {/* 🌥️ 背景の雲（装飾） */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent opacity-90"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
    </div>
  );
}
