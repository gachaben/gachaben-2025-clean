// src/pages/BattleSelectPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattleSelectPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    selectedItem,
    questionCount: initialQuestionCount = 1,
    initialSelectedPw = 100,
    enemy = "CPU",
  } = state || {};

  // 直打ち対策：アイテムが無ければ入口へ
  useEffect(() => {
    if (!selectedItem) {
      navigate("/battle/select-item", { replace: true });
    }
  }, [selectedItem, navigate]);

  if (!selectedItem) return null; // リダイレクト中

  // 選択状態
  const [questionCount, setQuestionCount] = useState(initialQuestionCount);
  const [selectedPw, setSelectedPw] = useState(initialSelectedPw);

  // バトル開始
  const startBattle = () => {
    navigate("/battle", {
      state: {
        selectedItem,
        questionCount,
        initialSelectedPw: selectedPw, // BattlePage側で受け取る
        enemy,
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">バトル設定</h1>

      {/* 選んだキャラの確認 */}
      <div className="mb-6">
        <p className="text-sm mb-2">選んだキャラ</p>
        <div className="flex items-center gap-3 justify-center">
          <ItemCard item={selectedItem} owned pwMode={false} />
          <button
            className="px-3 py-2 border rounded"
            onClick={() => navigate("/battle/select-item")}
          >
            変更する
          </button>
        </div>
      </div>

      {/* ラウンド数を選ぶ */}
      <div className="mb-6 text-center">
        <p className="mb-2 font-semibold">ラウンド数を選ぶ</p>
        {[1, 3, 5].map((n) => (
          <button
            key={n}
            className={`px-4 py-2 rounded border mx-1 ${
              questionCount === n ? "bg-blue-500 text-white" : "bg-white"
            }`}
            onClick={() => setQuestionCount(n)}
          >
            {n}回戦
          </button>
        ))}
      </div>

      {/* かけるPWを選ぶ */}
      <div className="mb-8 text-center">
        <p className="mb-2 font-semibold">かけるPWを選ぶ</p>
        {[100, 200, 300, 400, 500].map((pw) => (
          <button
            key={pw}
            className={`px-4 py-2 rounded border mx-1 ${
              selectedPw === pw ? "bg-green-500 text-white" : "bg-white"
            }`}
            onClick={() => setSelectedPw(pw)}
          >
            {pw}PW
          </button>
        ))}
      </div>

      {/* スタート */}
      <div className="text-center">
        <button
          className="bg-red-500 text-white px-6 py-3 rounded disabled:opacity-50"
          disabled={!selectedItem || !selectedPw || !questionCount}
          onClick={startBattle}
        >
          ▶ バトルスタート
        </button>
      </div>
    </div>
  );
};

export default BattleSelectPage;
