import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattleBetPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // ← selectedItem, enemyItem などを受け取る想定
  const { selectedItem, enemyItem, questionCount = 3 } = state || {};

  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  // ✅ CPUのベット処理（シンプルなランダム or ロジック化も可能）
  useEffect(() => {
    const timer = setTimeout(() => {
      const cpuOptions = [100, 200, 300, 400, 500];
      const randomBet = cpuOptions[Math.floor(Math.random() * cpuOptions.length)];
      setEnemyBet(randomBet);
    }, 2000); // 2秒後にCPUがベット！

    return () => clearTimeout(timer);
  }, []);

  // ✅ 両者ベット完了 → バトル開始へ
  useEffect(() => {
    if (myBet && enemyBet) {
      const timer = setTimeout(() => {
        navigate("/battle/play", {
          state: {
            selectedItem,
            enemyItem,
            myBet,
            enemyBet,
            questionCount,
          },
        });
      }, 1500); // 両者ベット後、1.5秒待って開始！

      return () => clearTimeout(timer);
    }
  }, [myBet, enemyBet, navigate, selectedItem, enemyItem, questionCount]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">💥 バトル開始準備 💥</h1>

      <div className="flex flex-wrap justify-center items-start gap-8">
        {/* 👤 あなた */}
        <div className="w-72 bg-white p-4 rounded shadow">
          <h2 className="text-center font-bold text-blue-600 mb-2">🧑 あなた</h2>
          <ItemCard item={selectedItem} owned={true} />
          <p className="text-center mt-2">かけるPWを選んでね</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[100, 200, 300, 400, 500].map((amount) => (
              <button
                key={amount}
                onClick={() => setMyBet(amount)}
                className={`px-4 py-2 rounded-full border font-bold ${
                  myBet === amount
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 border-blue-500"
                }`}
              >
                {amount} PW
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 VS */}
        <div className="flex flex-col justify-center items-center text-xl font-bold">
          <p className="text-gray-600">VS</p>
        </div>

        {/* 🤖 相手 */}
        <div className="w-72 bg-white p-4 rounded shadow">
          <h2 className="text-center font-bold text-purple-600 mb-2">👑 カブトムシくん</h2>
          <ItemCard item={enemyItem} owned={false} />
          <p className="text-center mt-4">
            {enemyBet ? `🔒 ${enemyBet} PW ベット！` : "🤔 ベット中..."}
          </p>
        </div>
      </div>

      {/* 🔁 説明表示 */}
      <div className="text-center mt-8 text-sm text-gray-700">
        <p>おたがいにベットがおわったら、対戦スタート！</p>
        <p className="mt-1">ベット後、自動で次の画面に進むよ！</p>
      </div>
    </div>
  );
};

export default BattleBetPage;
