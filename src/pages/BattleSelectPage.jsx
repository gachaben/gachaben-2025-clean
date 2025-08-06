// src/pages/BattleSelectPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BattleSelectPage = () => {
  const navigate = useNavigate();
  const [selectedRounds, setSelectedRounds] = useState(1);
  const [selectedPw, setSelectedPw] = useState(100);

  const handleStart = () => {
    navigate("/battle", {
      state: {
        rounds: selectedRounds,
        pw: selectedPw,
      },
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">バトル設定</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">ラウンド数を選ぶ</h3>
        <div className="flex justify-around">
          {[1, 3, 5].map((num) => (
            <button
              key={num}
              className={`py-2 px-4 rounded border ${
                selectedRounds === num
                  ? "bg-blue-500 text-white"
                  : "bg-white text-blue-500 border-blue-500"
              }`}
              onClick={() => setSelectedRounds(num)}
            >
              {num}回戦
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">\        <h3 className="text-lg font-semibold mb-2">かけるPWを選ぶ</h3>
        <div className="flex justify-around">
          {[100, 200, 300, 400, 500].map((pw) => (
            <button
              key={pw}
              className={`py-2 px-4 rounded border ${
                selectedPw === pw
                  ? "bg-green-500 text-white"
                  : "bg-white text-green-500 border-green-500"
              }`}
              onClick={() => setSelectedPw(pw)}
            >
              {pw}PW
            </button>
          ))}
        </div>
      </div>

      <button
        className="w-full py-3 bg-red-500 text-white font-bold rounded hover:bg-red-600"
        onClick={handleStart}
      >
        ▶ バトルスタート
      </button>
    </div>
  );
};

export default BattleSelectPage;
