// src/pages/BattleItemSelectPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

export default function BattleItemSelectPage() {
  const navigate = useNavigate();          // ← ここが重要（nav を作る or navigate を使う）
  const { state } = useLocation();

  const items = state?.items || [];
  const preselected = state?.preselectedItem || null;

  const pickEnemy = (my) => {
    const pool = items.filter(
      (it) => (it.id || it.itemId) !== (my.id || my.itemId)
    );
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  };

  const onSelect = (it) => {
    navigate("/battle", {
      state: {
        selectedItem: it,
        enemyItem: pickEnemy(it),
        round: 1,
        totalRounds: 3,
        myPwLeft: 300,
        enemyPwLeft: 300,
      },
    });
  };

  if (!items.length) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="mb-3">選べるアイテムが渡ってきていません。</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-white shadow hover:shadow-md"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-lg font-bold mb-3">バトルするアイテムを選んでね</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it) => {
          const key = it.id || it.itemId;
          const isPre =
            preselected && (preselected.id || preselected.itemId) === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(it)}
              className={`rounded-2xl bg-white shadow hover:shadow-md p-2 relative ${
                isPre ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
            >
              <ItemCard item={it} />
              {isPre && (
                <span className="absolute top-2 right-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                  おすすめ
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
