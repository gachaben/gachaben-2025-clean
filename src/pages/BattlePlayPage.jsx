// src/pages/BattlePlayPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LS_BATTLE_KEY = "currentBattleId";
const safeUUID = () =>
  (crypto?.randomUUID?.() ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export default function BattlePlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // battleId は state → localStorage → 生成の順で保証
  const battleId =
    state?.battleId ||
    localStorage.getItem(LS_BATTLE_KEY) ||
    (() => {
      const id = safeUUID();
      try { localStorage.setItem(LS_BATTLE_KEY, id); } catch {}
      return id;
    })();

  const finishBattle = ({
    myTotalPw,
    enemyTotalPw,
    myCorrect,
    cpuCorrect,
    winner, // "player" | "cpu" | "draw"
  }) => {
    // 勝敗を堅牢に判定（PW→winner→正解数）
    const isWin =
      winner === "player" ||
      (Number.isFinite(myTotalPw) && Number.isFinite(enemyTotalPw) && myTotalPw > enemyTotalPw) ||
      (Number.isFinite(myCorrect) && Number.isFinite(cpuCorrect) && myCorrect > cpuCorrect);

    navigate("/battle/result", {
      state: {
        battleId,                 // ← 結果ページの付与処理に必須！
        isWin,                    // true / false
        baseEarnBpt: isWin ? 15 : 5,
        myTotalPw,
        enemyTotalPw,
        myCorrect,
        cpuCorrect,
        winner,
      },
    });
  };

  // ↓ いまはテストボタン。実際はバトル終了時の処理から finishBattle を呼んでね
  return (
    <div className="p-6">
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
}
