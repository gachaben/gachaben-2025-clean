// src/components/BattleResultModal.jsx

import React from "react";

const getRank = (score) => {
  if (score >= 150) return "S";
  if (score >= 80) return "A";
  return "B";
};

const BattleResultModal = ({ score, combo, onClose }) => {
  const rank = getRank(score);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
        <h2 className="text-xl font-bold mb-4">バトル評価</h2>
        <p className="text-lg mb-2">スコア：{score}</p>
        <p className="text-lg mb-2">最大コンボ：{combo}</p>
        <p className="text-3xl font-extrabold text-purple-600 mt-4">
          🏅 ランク：{rank}
        </p>
        <button
          className="mt-6 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default BattleResultModal;
