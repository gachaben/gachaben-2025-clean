// ------------------------------------------------------
// 📚 src/components/battle/QuestionPanel.jsx
// ドレミチャレンジバトル：出題＋選択肢UI
// ------------------------------------------------------
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionPanel({ question, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleClick = (choice) => {
    if (selected !== null) return; // 2回押し防止
    setSelected(choice);
    const correct = choice === question.answer;
    setIsCorrect(correct);
    setTimeout(() => onAnswer(correct), 1200);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mt-6 px-4">
      {/* 問題文 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg font-bold text-gray-800 text-center mb-6"
      >
        {question.text}
      </motion.div>

      {/* 選択肢ボタン */}
      <div className="grid grid-cols-1 gap-3 w-full">
        {question.choices.map((choice, idx) => {
          const isSelected = selected === choice;
          const correct = isCorrect && isSelected;
          const incorrect = !isCorrect && isSelected;
          return (
            <motion.button
              key={idx}
              whileHover={!selected ? { scale: 1.03 } : {}}
              whileTap={!selected ? { scale: 0.97 } : {}}
              disabled={selected !== null}
              onClick={() => handleClick(choice)}
              className={`w-full py-3 rounded-xl text-lg font-semibold border shadow-sm transition-colors duration-300 ${
                correct
                  ? "bg-green-400 text-white border-green-500"
                  : incorrect
                  ? "bg-rose-400 text-white border-rose-500"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
              }`}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>

      {/* 正誤フィードバック */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 text-lg font-bold ${
              isCorrect ? "text-green-500" : "text-rose-500"
            }`}
          >
            {isCorrect ? "⭕ 正解！" : "❌ ざんねん！"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
