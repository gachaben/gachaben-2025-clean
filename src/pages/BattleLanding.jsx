import React from "react";
import { useNavigate } from "react-router-dom";

export default function BattleLanding() {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">バトル</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => navigate("/battle/rank")}
      >
        バトルする →
      </button>
    </div>
  );
}
