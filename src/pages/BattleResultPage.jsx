import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

// ▼ ガチャ設定（均等）— 後で確率を締めたい時は weights を変えるだけ
const GACHA_TABLE = [
  { reward: 10, weight: 1 }, // 1/3
  { reward: 15, weight: 1 }, // 1/3
  { reward: 30, weight: 1 }, // 1/3
];
// 例）控えめにしたい時：[{reward:10,weight:4},{reward:15,weight:4},{reward:30,weight:2}]

function rollGacha(table) {
  const total = table.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of table) {
    if ((r -= t.weight) <= 0) return t.reward;
  }
  return table[table.length - 1].reward;
}

const BattleResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const myTotalPw = state?.myTotalPw ?? 0;
  const enemyTotalPw = state?.enemyTotalPw ?? 0;

  const isWin = myTotalPw > enemyTotalPw;
  const isLose = myTotalPw < enemyTotalPw;

  // 基本付与：勝利15 / 敗北5
  const baseEarnBpt = useMemo(() => (isWin ? 15 : 5), [isWin]);

  const [granted, setGranted] = useState(false);
  const [gachaUsed, setGachaUsed] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);
  const [lastGachaReward, setLastGachaReward] = useState(null);

  // 初回：基本Bptを付与
  useEffect(() => {
    const grant = async () => {
      if (granted) return;
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), { bpt: increment(baseEarnBpt) });
      setGranted(true);
    };
    grant().catch(console.error);
  }, [granted, baseEarnBpt]);

  let resultText = "";
  let resultColor = "";
  if (isWin) {
    resultText = "🏆 勝利！";
    resultColor = "text-green-600";
  } else if (isLose) {
    resultText = "💥 敗北…";
    resultColor = "text-red-600";
  } else {
    // サドンデス仕様では来ない想定だが保険
    resultText = "🤝 引き分け";
    resultColor = "text-gray-600";
  }

  const handleGacha = async () => {
    if (gachaUsed || adPlaying) return;
    setAdPlaying(true);

    // 🎬 広告視聴の疑似演出（2秒）
    await new Promise((r) => setTimeout(r, 2000));

    const reward = rollGacha(GACHA_TABLE);

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { bpt: increment(reward) });
      }
      setLastGachaReward(reward);
      setGachaUsed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setAdPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-4">
      <h1 className={`text-3xl font-bold mb-4 ${resultColor}`}>{resultText}</h1>

      <div className="bg-white rounded shadow p-4 w-full max-w-sm text-center mb-4">
        <p className="text-lg mb-2">あなたの残りPW：<span className="font-bold">{myTotalPw}</span></p>
        <p className="text-lg">相手の残りPW：<span className="font-bold">{enemyTotalPw}</span></p>
      </div>

      <div className="bg-white rounded shadow p-4 w-full max-w-sm text-center mb-4">
        <h2 className="font-bold mb-2">🎁 獲得Bpt</h2>
        <p className="text-base mb-1">
          今回の基本付与：<span className="font-bold">{baseEarnBpt}</span> Bpt（参加5 + {isWin ? "勝利10" : "勝利0"}）
        </p>

        <div className="mt-3">
          <button
            onClick={handleGacha}
            disabled={gachaUsed || adPlaying}
            className={`px-4 py-2 rounded shadow font-bold ${
              gachaUsed
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : adPlaying
                ? "bg-gray-300 text-gray-700"
                : "bg-pink-500 text-white hover:bg-pink-600"
            }`}
          >
            {adPlaying
              ? "広告視聴中…"
              : gachaUsed
              ? "Bptガチャ 済み"
              : "広告視聴で Bptガチャ（10 / 15 / 30）"}
          </button>

          {lastGachaReward != null && (
            <p className="mt-2 text-sm">
              ガチャ結果：<span className="font-bold">{lastGachaReward}</span> Bpt を追加付与！
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/battle/item-select")}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
        >
          もう一度戦う
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded shadow"
        >
          ホームへ戻る
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-600">※ ログインしていない場合はBptは加算されません。</p>
    </div>
  );
};

export default BattleResultPage;
