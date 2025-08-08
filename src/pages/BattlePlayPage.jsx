import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const MIN_BET = 100;
const MAX_BET = 500;
const STEP = 100;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, hi));
const snap100 = (n) => Math.round(n / 100) * 100;

const BattlePlayPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { selectedItem, enemyItem, questionCount = 3, battleId } = state || {};

  // 残PW
  const [myPwLeft, setMyPwLeft] = useState(300);
  const [enemyPwLeft, setEnemyPwLeft] = useState(300);

  // 勝敗カウント
  const [myCorrect, setMyCorrect] = useState(0);
  const [cpuCorrect, setCpuCorrect] = useState(0);

  // ベット
  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  // ラウンド
  const [currentRound, setCurrentRound] = useState(1);

  // フラッシュ & フェード
  const [gainSide, setGainSide] = useState(null);
  const [gainAmount, setGainAmount] = useState(0);
  const gainTimerRef = useRef(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    return () => {
      if (gainTimerRef.current) clearTimeout(gainTimerRef.current);
    };
  }, []);

  const isFinalRound = currentRound === questionCount;

  // 今ラウンドの許容ベット範囲（プレイヤー）
  const playerRange = useMemo(() => {
    const max = Math.min(myPwLeft, isFinalRound ? myPwLeft : MAX_BET);
    const min = myPwLeft >= MIN_BET ? MIN_BET : 1; // 100未満でもALL-IN許可
    return { min, max };
  }, [myPwLeft, isFinalRound]);

  // 敵ベットAI
  const decideEnemyBet = () => {
    if (isFinalRound) return enemyPwLeft; // 最終はALL-IN
    const enemyMax = Math.min(enemyPwLeft, MAX_BET);
    if (enemyPwLeft < MIN_BET) return enemyPwLeft; // 少額でもALL-IN
    let guess = enemyPwLeft * (0.2 + Math.random() * 0.3); // 20〜50%
    let bet = snap100(guess);
    bet = clamp(bet, MIN_BET, enemyMax);
    return bet;
  };

  // ラウンド開始時：敵ベット先出し + プレイヤー初期値
  useEffect(() => {
    setEnemyBet(decideEnemyBet());
    setMyBet((prev) => {
      const base = prev ?? (playerRange.min >= 100 ? playerRange.min : myPwLeft);
      const snapped = snap100(base);
      return clamp(snapped, playerRange.min, playerRange.max);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, myPwLeft, enemyPwLeft]);

  // ラウンド決着（最終値をローカルで確定 → navigateに渡す）
  const resolveRound = ({ myBet, enemyBet, myCorrectAnswer, cpuCorrectAnswer }) => {
    let transfer = 0;
    let newMy = myPwLeft;
    let newEnemy = enemyPwLeft;
    let addMy = 0;
    let addCpu = 0;

    if (myCorrectAnswer && !cpuCorrectAnswer) {
      transfer = Math.min(enemyPwLeft, myBet);
      newMy += transfer;
      newEnemy -= transfer;
      addMy = 1;

      setGainSide("player");
      setGainAmount(transfer);
    } else if (!myCorrectAnswer && cpuCorrectAnswer) {
      transfer = Math.min(myPwLeft, enemyBet);
      newMy -= transfer;
      newEnemy += transfer;
      addCpu = 1;

      setGainSide("cpu");
      setGainAmount(transfer);
    }
    gainTimerRef.current = setTimeout(() => setGainSide(null), 900);

    // 表示用ゲージは少し遅らせる
    setTimeout(() => {
      setMyPwLeft(newMy);
      setEnemyPwLeft(newEnemy);
    }, 600);

    const finalMyCorrect = myCorrect + addMy;
    const finalCpuCorrect = cpuCorrect + addCpu;

    // ラウンド継続 or 結果
    if (currentRound < questionCount) {
      setTimeout(() => {
        setMyCorrect(finalMyCorrect);
        setCpuCorrect(finalCpuCorrect);
        setCurrentRound((r) => r + 1);
        setMyBet(null);
        setEnemyBet(null);
      }, 900);
    } else {
      // 最終判定（PW差優先 → 同PWなら正答数 → それでも同じなら引き分け）
      const result =
        newMy > newEnemy ? "win" : newMy < newEnemy ? "lose" :
        finalMyCorrect > finalCpuCorrect ? "win" :
        finalMyCorrect < finalCpuCorrect ? "lose" : "draw";

      // スローモーション → フェード → 遷移
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          navigate("/battle/result", {
            state: {
              battleId,
              result,
              myPwLeft: newMy,
              enemyPwLeft: newEnemy,
              myCorrect: finalMyCorrect,
              cpuCorrect: finalCpuCorrect,
              questionCount,
            },
          });
        }, 800);
      }, 900);
    }
  };

  // --- デモ（本番は正誤確定の所で resolveRound を呼ぶ） ---
  const demoWin = () => {
    const safeBet = clamp(snap100(myBet ?? playerRange.min), playerRange.min, playerRange.max);
    resolveRound({ myBet: safeBet, enemyBet, myCorrectAnswer: true, cpuCorrectAnswer: false });
  };
  const demoLose = () => {
    const safeBet = clamp(snap100(myBet ?? playerRange.min), playerRange.min, playerRange.max);
    resolveRound({ myBet: safeBet, enemyBet, myCorrectAnswer: false, cpuCorrectAnswer: true });
  };

  // 入力UI
  const increment = () => setMyBet((v) => clamp(snap100((v ?? 0) + STEP), playerRange.min, playerRange.max));
  const decrement = () => setMyBet((v) => clamp(snap100(Math.max(0, (v ?? 0) - STEP)), playerRange.min, playerRange.max));
  const setAllIn = () => setMyBet(playerRange.max);
  const setFixed = (amt) => setMyBet(() => clamp(amt, playerRange.min, playerRange.max));

  const playerRangeText =
    playerRange.min === playerRange.max
      ? `今回のベット範囲: ${playerRange.max} PW（ALL-INのみ）`
      : `今回のベット範囲: ${playerRange.min}〜${playerRange.max} PW ${isFinalRound ? "（最終）" : ""}`;

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white gap-8 transition-opacity duration-800 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 上（相手） */}
      <div className="relative">
        <ItemCard item={enemyItem} />
        {gainSide === "cpu" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-pop text-white text-sm font-bold px-3 py-1 rounded-full bg-red-600/90 shadow">
            +{gainAmount} PW
          </div>
        )}
        <div className="mt-1 text-center text-xs text-gray-300">
          ベット: {enemyBet ?? "-"} PW
        </div>
      </div>

      {/* 中央ゲージ */}
      <div className="w-72 h-6 bg-gray-700 rounded-full overflow-hidden relative">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${(myPwLeft / Math.max(1, myPwLeft + enemyPwLeft)) * 100}%` }}
        />
        <div className="absolute inset-0 flex justify-between items-center text-xs px-2 font-bold">
          <span>{myPwLeft} PW</span>
          <span>{enemyPwLeft} PW</span>
        </div>
      </div>

      {/* 下（自分） */}
      <div className="relative w-[280px] flex flex-col items-center">
        <ItemCard item={selectedItem} />
        {gainSide === "player" && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 animate-pop text-white text-sm font-bold px-3 py-1 rounded-full bg-blue-600/90 shadow">
            +{gainAmount} PW
          </div>
        )}

        {/* ベットUI */}
        <div className="mt-3 w-full space-y-2">
          <div className="text-center text-xs text-gray-300">{playerRangeText}</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={decrement}
              disabled={playerRange.min === playerRange.max || (myBet ?? 0) <= playerRange.min}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -100
            </button>
            <input
              type="number"
              inputMode="numeric"
              step={STEP}
              min={playerRange.min}
              max={playerRange.max}
              value={myBet ?? ""}
              onChange={(e) => {
                const val = Number(e.target.value || 0);
                setMyBet(clamp(snap100(val), playerRange.min, playerRange.max));
              }}
              className="w-24 text-center rounded bg-white/10 px-2 py-1 outline-none"
            />
            <button
              onClick={increment}
              disabled={playerRange.min === playerRange.max || (myBet ?? 0) >= playerRange.max}
              className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +100
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[100, 200, 300, 400, 500].map((amt) => {
              const disabled = amt < playerRange.min || amt > playerRange.max;
              return (
                <button
                  key={amt}
                  onClick={() => setFixed(amt)}
                  disabled={disabled}
                  className={`px-3 py-1 rounded text-sm ${
                    myBet === amt ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
                  } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {amt}
                </button>
              );
            })}
            <button
              onClick={setAllIn}
              className={`px-3 py-1 rounded text-sm ${
                myBet === playerRange.max ? "bg-blue-500" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              ALL-IN
            </button>
          </div>
        </div>
      </div>

      {/* デモ用（本番では削除） */}
      <div className="flex gap-4">
        <button onClick={demoWin} className="px-4 py-2 rounded bg-green-600">勝ちテスト</button>
        <button onClick={demoLose} className="px-4 py-2 rounded bg-red-600">負けテスト</button>
      </div>
    </div>
  );
};

export default BattlePlayPage;
