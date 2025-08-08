// src/pages/BattlePlayPage.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LS_BATTLE_KEY = "currentBattleId";

function safeUUID() {
  try {
    return crypto.randomUUID();
  } catch {
    return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

const BattlePlayPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ★ state優先 → localStorage → それでも無ければ生成して保存（保険）
  const battleId = useMemo(() => {
    const fromState = state?.battleId;
    if (fromState) return fromState;
    try {
      const fromLs = localStorage.getItem(LS_BATTLE_KEY);
      if (fromLs) return fromLs;
      const gen = safeUUID();
      localStorage.setItem(LS_BATTLE_KEY, gen);
      console.warn("battleId missing in Play. generated fallback:", gen);
      return gen;
    } catch {
      const gen = safeUUID();
      console.warn("battleId missing in Play. generated fallback(no LS):", gen);
      return gen;
    }
  }, [state?.battleId]);

  // ・・・・ここにあなたのバトル進行（PW選択→問題→採点）の処理・・・・
  // ラウンド終了時など、Resultへ渡すときに必要な値をまとめる

  const finishBattle = ({
    myTotalPw,
    enemyTotalPw,
    myCorrect,
    cpuCorrect,
    winner, // "player" | "cpu" | "draw"
  }) => {
    navigate("/battle/result", {
      state: {
        battleId,          // ★ 必ず渡す
        myTotalPw,         // 数値
        enemyTotalPw,      // 数値
        myCorrect,         // 数値
        cpuCorrect,        // 数値
        winner,            // "player" | "cpu" | "draw"
      },
    });
  };

  // 例：仮の終了ボタン（実装中のトリガをここに接続）
  return (
    <div className="p-6">
      {/* あなたの既存UI */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={() =>
          finishBattle({
            myTotalPw: 0,
            enemyTotalPw: 500,
            myCorrect: 1,
            cpuCorrect: 2,
            winner: "cpu",
          })
        }
      >
        （テスト）結果へ
      </button>
    </div>
  );
};

export default BattlePlayPage;

