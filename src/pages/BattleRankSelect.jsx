import React from "react";
import { useNavigate } from "react-router-dom";

export default function BattleRankSelect() {
  const navigate = useNavigate();

  const go = (rank) => {
    navigate("/battle/item-select", { state: { rank, questionCount: 3 } });
  };

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      <h2 className="text-lg font-bold mb-3">ランクを選んでね！</h2>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-yellow-400" onClick={() => go("S")}>Sランクで戦う！</button>
        <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={() => go("A")}>Aランクで戦う！</button>
        <button className="px-4 py-2 rounded bg-green-500 text-white" onClick={() => go("B")}>Bランクで戦う！</button>
      </div>
    </div>
  );
}
