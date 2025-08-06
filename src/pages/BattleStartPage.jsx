import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ItemCard from '../components/ItemCard'; // ✅ 追加！

const BattleStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItem = location.state?.selectedItem;

  const [questionCount, setQuestionCount] = useState(1);
  const enemies = ['カブトムシくん', 'クワガタおじさん', 'ミノムシ先生'];
  const [enemy] = useState(enemies[Math.floor(Math.random() * enemies.length)]);

  const handleStart = () => {
    if (!selectedItem) return;
    navigate('/battle', {
      state: {
        enemy,
        questionCount,
        selectedItem,
      },
    });
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold text-red-600 mb-4">
          ⚠️ 先にバトルキャラを選んでください！
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          onClick={() => navigate('/battle/item-select')}
        >
          バトルキャラを選びに行く
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">バトル準備</h1>

      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <p className="text-lg mb-4">🧑 あなた vs 👾 {enemy}</p>

        {/* ✅ キャラ表示に ItemCard を使用！ */}
        <div className="flex justify-center mb-4">
          <ItemCard item={selectedItem} owned={true} />
        </div>

        <div className="mt-4">
          <h2 className="font-semibold mb-2">🧮 問題数を選ぼう：</h2>
          {[1, 3, 5].map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`m-1 px-4 py-2 rounded-full ${
                questionCount === count
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {count} 問
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-full shadow-lg"
        >
          ▶️ バトルスタート！
        </button>
      </div>
    </div>
  );
};

export default BattleStartPage;
