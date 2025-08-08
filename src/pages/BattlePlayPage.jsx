// src/pages/BattlePlayPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattlePlayPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { selectedItem, enemyItem, questionCount = 3, battleId } = state || {};

  const [myPwLeft, setMyPwLeft] = useState(300);
  const [enemyPwLeft, setEnemyPwLeft] = useState(300);

  const [myCorrect, setMyCorrect] = useState(0);
  const [cpuCorrect, setCpuCorrect] = useState(0);

  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  const [currentRound, setCurrentRound] = useState(1);
  const [lastTransfer, setLastTransfer] = useState(0);

  // ★ ラウンド決着処理
  const resolveRound = ({ myBet, enemyBet, roundWinner }) => {
    // ベットは残りPWの範囲に制限
    myBet = Math.max(1, Math.min(myBet, myPwLeft));
    enemyBet = Math.max(1, Math.min(enemyBet, enemyPwLeft));

    // 奪取できる最大値を制限（相手の残りPWまで）
    const capForPlayer = Math.min(enemyBet, enemyPwLeft);
    const capForEnemy = Math.min(myBet, myPwLeft);

    let transfer = 0;
    let newMy = myPwLeft;
    let newEnemy = enemyPwLeft;

    if (roundWinner === "player") {
      // 勝ったら相手のベット分を奪う
      transfer = capForPlayer;
      newMy += transfer;
      newEnemy -= transfer;
      setMyCorrect((prev) => prev + 1);
    } else if (roundWinner === "cpu") {
      transfer = capForEnemy;
      newMy -= transfer;
      newEnemy += transfer;
      setCpuCorrect((prev) => prev + 1);
    }

    setMyPwLeft(Math.max(0, newMy));
    setEnemyPwLeft(Math.max(0, newEnemy));
    setLastTransfer(transfer);

    // 勝敗チェック（サドンデス対応：必ず決着まで）
    if (newMy <= 0 || newEnemy <= 0) {
      finishBattle({
        myTotalPw: newMy,
        enemyTotalPw: newEnemy,
        myCorrect: myCorrect + (roundWinner === "player" ? 1 : 0),
        cpuCorrect: cpuCorrect + (roundWinner === "cpu" ? 1 : 0),
        winner: newMy > newEnemy ? "player" : "cpu",
      });
    } else {
      // 次のラウンドへ
      setCurrentRound((prev) => prev + 1);
      setMyBet(null);
      setEnemyBet(null);
    }
  };

  // ★ バトル終了
  const finishBattle = ({ myTotalPw, enemyTotalPw, myCorrect, cpuCorrect, winner }) => {
    const isWin = winner === "player";
    navigate("/battle/result", {
      state: {
        battleId,
        isWin,
        baseEarnBpt: isWin ? 15 : 5, // 勝ち=15, 負け=5
        myTotalPw,
        enemyTotalPw,
        myCorrect,
        cpuCorrect,
      },
    });
  };

  // ★ テスト用（勝敗をランダム決定）
  const simulateAnswer = () => {
    const roundWinner = Math.random() < 0.5 ? "player" : "cpu";
    resolveRound({ myBet, enemyBet, roundWinner });
  };

  return (
    <div className="p-4">
      <h2>ラウンド {currentRound}</h2>
      <div className="flex justify-around">
        <div>
          <ItemCard item={selectedItem} />
          <p>自分PW: {myPwLeft}</p>
          <input
            type="number"
            placeholder="自分のベット"
            value={myBet || ""}
            onChange={(e) => setMyBet(parseInt(e.target.value))}
          />
        </div>
        <div>
          <ItemCard item={enemyItem} />
          <p>相手PW: {enemyPwLeft}</p>
          <input
            type="number"
            placeholder="相手のベット"
            value={enemyBet || ""}
            onChange={(e) => setEnemyBet(parseInt(e.target.value))}
          />
        </div>
      </div>

           <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={simulateAnswer}
        disabled={!myBet || !enemyBet}
      >
        勝敗シミュレーション
      </button>

      {/* ▼ 勝利パステスト用ボタン */}
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
        onClick={() =>
          finishBattle({
            myTotalPw: 200,
            enemyTotalPw: 0,
            myCorrect: myCorrect + 1,
            cpuCorrect,
            winner: "player",
          })
        }
      >
        （テスト）勝利で結果へ
      </button>

      {lastTransfer > 0 && <p>奪取: {lastTransfer} PW</p>}
    </div>
  );

};

export default BattlePlayPage;
