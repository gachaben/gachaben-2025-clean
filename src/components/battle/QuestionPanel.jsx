// ------------------------------------------------------
// 🎯 QuestionPanel.jsx（正誤判定を親へ返す）
// ------------------------------------------------------
import React from "react";

export default function QuestionPanel({ question, onAnswer }) {
  const handleSelect = (choice) => {
    const isCorrect = choice === question.answer;
    console.log("💡 選択:", choice, "答え:", question.answer, "→", isCorrect);
    onAnswer(isCorrect);
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-6">{question.text}</h2>
      <div className="flex flex-col gap-3 w-[260px]">
        {question.choices.map((c) => (
          <button
            key={c}
            onClick={() => handleSelect(c)}
            className="px-4 py-2 bg-white rounded-xl shadow hover:bg-pink-50 border border-gray-200"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
