// src/pages/BattlePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LS_BATTLE_KEY = "currentBattleId";

function safeUUID() {
  try {
    return crypto.randomUUID();
  } catch {
    return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default function BattlePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(3); // デフォルト3問

  const startBattle = () => {
    const id = safeUUID();
    try {
      localStorage.setItem(LS_BATTLE_KEY, id);
    } catch {}
    navigate("/battle/item-select", {
      state: {
        battleId: id,
        questionCount,
      },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">バトル開始</h1>

      <div className="mb-4 flex gap-2">
        {[1, 3, 5].map((n) => (
          <button
            key={n}
            onClick={() => setQuestionCount(n)}
            className={`px-3 py-2 rounded border ${
              questionCount === n ? "bg-blue-500 text-white" : "bg-white"
            }`}
          >
            {n}問
          </button>
        ))}
      </div>

      <button
        onClick={startBattle}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        アイテムを選ぶ →
      </button>
    </div>
  );
}


