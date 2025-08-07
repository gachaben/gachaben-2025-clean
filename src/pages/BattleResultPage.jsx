// src/pages/BattleResultPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BattleResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { myRemainingPw, enemyRemainingPw } = state || {};

  if (myRemainingPw === undefined || enemyRemainingPw === undefined) {
    return <div>結果データがありません。</div>;
  }

  const resultText =
    myRemainingPw > enemyRemainingPw
      ? "🎉 あなたの勝ち！"
      : myRemainingPw < enemyRemainingPw
      ? "😖 残念！負けちゃった"
      : "🤝 引き分け！";

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">バトル結果</h1>

      <div className="text-2xl font-bold text-blue-800 mb-6">{resultText}</div>

      <div className="text-center text-lg mb-6">
        <p>🧑 あなたの残りPW：{myRemainingPw}</p>
        <p>👑 相手の残りPW：{enemyRemainingPw}</p>
      </div>

      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600"
        onClick={() => navigate("/")}
      >
        トップへ戻る
      </button>
    </div>
  );
};

export default BattleResultPage;
