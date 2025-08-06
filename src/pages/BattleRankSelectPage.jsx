// src/pages/BattleRankSelectPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const BattleRankSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-6">
      <h2 className="text-xl font-bold mb-6">⚔️ ランクを選んでバトルキャラを決めよう！</h2>

      <div className="flex gap-6">
        {/* Sランク（金） */}
        <button
          onClick={() => navigate("/zukan/kontyu/S")}
          className="px-6 py-3 rounded text-white font-bold shadow-md"
          style={{ backgroundColor: "#FFD700" }} // 金色
        >
          Sランクで戦う！
        </button>

        {/* Aランク（赤） */}
        <button
          onClick={() => navigate("/zukan/kontyu/A")}
          className="px-6 py-3 rounded text-white font-bold shadow-md bg-red-500 hover:bg-red-600"
        >
          Aランクで戦う！
        </button>

        {/* Bランク（緑） */}
        <button
          onClick={() => navigate("/zukan/kontyu/B")}
          className="px-6 py-3 rounded text-white font-bold shadow-md bg-green-500 hover:bg-green-600"
        >
          Bランクで戦う！
        </button>
      </div>
    </div>
  );
};

export default BattleRankSelectPage;
