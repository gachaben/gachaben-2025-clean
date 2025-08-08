import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BattleResultPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    result,                  // 'win' | 'lose' | 'draw'
    myPwLeft = 0,
    enemyPwLeft = 0,
    myCorrect = 0,
    cpuCorrect = 0,
    questionCount = 3,
    battleId,
  } = state || {};

  // 後方互換：resultが無い場合はここで判定
  const computed =
    result ||
    (myPwLeft > enemyPwLeft ? "win" : myPwLeft < enemyPwLeft ? "lose"
      : myCorrect > cpuCorrect ? "win"
      : myCorrect < cpuCorrect ? "lose" : "draw");

  // Bpt 基本付与例（お好みで）
  const baseBpt = 5;          // 参加
  const winBonus = computed === "win" ? 10 : 0;
  const gainedBpt = baseBpt + winBonus;

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 p-6">
      <h1 className={`text-2xl font-bold mb-4 ${computed === "win" ? "text-blue-600" : computed === "lose" ? "text-red-600" : "text-gray-600"}`}>
        {computed === "win" ? "勝利！" : computed === "lose" ? "敗北…" : "引き分け"}
      </h1>

      <div className="space-y-2 mb-6">
        <div>あなたの残りPW：{myPwLeft}</div>
        <div>相手の残りPW：{enemyPwLeft}</div>
        <div>正解数：あなた {myCorrect} / 相手 {cpuCorrect}（全 {questionCount} 問）</div>
      </div>

      <div className="p-4 rounded bg-white shadow inline-block mb-6">
        <div className="font-semibold mb-1">🎁 獲得Bpt</div>
        <div>今回の基本付与：{baseBpt} Bpt（参加{computed === "win" ? "＋ 勝利10" : ""}）</div>
        <div className="text-xl font-bold mt-1">合計：{gainedBpt} Bpt</div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate("/battle", { replace: true })}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          もう一度戦う
        </button>
        <button
          onClick={() => navigate("/", { replace: true })}
          className="px-4 py-2 rounded bg-gray-300"
        >
          ホームへ戻る
        </button>
      </div>

      {/* デバッグ */}
      {battleId && <div className="mt-4 text-xs text-gray-500">battleId: {battleId}</div>}
    </div>
  );
};

export default BattleResultPage;
