import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattleBetPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // ↁEselectedItem, enemyItem などを受け取る想宁E
  const { selectedItem, enemyItem, questionCount = 3 } = state || {};

  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  // ✁ECPUのベット�E琁E��シンプルなランダム or ロジチE��化も可能�E�E
  useEffect(() => {
    const timer = setTimeout(() => {
      const cpuOptions = [100, 200, 300, 400, 500];
      const randomBet = cpuOptions[Math.floor(Math.random() * cpuOptions.length)];
      setEnemyBet(randomBet);
    }, 2000); // 2秒後にCPUが�EチE���E�E

    return () => clearTimeout(timer);
  }, []);

  // ✁E両老E�EチE��完亁EↁEバトル開始へ
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
      }, 1500); // 両老E�EチE��後、E.5秒征E��て開始！E

      return () => clearTimeout(timer);
    }
  }, [myBet, enemyBet, navigate, selectedItem, enemyItem, questionCount]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">💥 バトル開始準備 💥</h1>

      <div className="flex flex-wrap justify-center items-start gap-8">
        {/* 👤 あなぁE*/}
        <div className="w-72 bg-white p-4 rounded shadow">
          <h2 className="text-center font-bold text-blue-600 mb-2">🧁EあなぁE/h2>
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

        {/* 🤁E相扁E*/}
        <div className="w-72 bg-white p-4 rounded shadow">
          <h2 className="text-center font-bold text-purple-600 mb-2">👑 カブトムシくん</h2>
          <ItemCard item={enemyItem} owned={false} />
          <p className="text-center mt-4">
            {enemyBet ? `🔒 ${enemyBet} PW ベット！` : "🤁Eベット中..."}
          </p>
        </div>
      </div>

      {/* 🔁 説明表示 */}
      <div className="text-center mt-8 text-sm text-gray-700">
        <p>おたがいにベットがおわったら、対戦スタート！E/p>
        <p className="mt-1">ベット後、�E動で次の画面に進むよ！E/p>
      </div>
    </div>
  );
};

export default BattleBetPage;
