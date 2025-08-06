import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

const BattleResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [reward, setReward] = useState(0);

  if (!state) {
    navigate("/battle/start");
    return null;
  }

  const { enemy, myTotalPw, enemyTotalPw, battleLog } = state;

  const getResultMessage = () => {
    if (myTotalPw > enemyTotalPw) return "🏆 勝ちました！";
    if (myTotalPw < enemyTotalPw) return "😢 負けました…";
    return "🤝 引き分け！";
  };

  const calculateReward = () => {
    return myTotalPw > enemyTotalPw ? 10 : 5;
  };

  useEffect(() => {
    const saveBpt = async () => {
      if (saved) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const rewardPoint = calculateReward();

      try {
        await updateDoc(userRef, {
          bpt: increment(rewardPoint),
        });
        setReward(rewardPoint);
        setSaved(true);
      } catch (error) {
        console.error("Bpt保存エラー:", error);
      }
    };

    saveBpt();
  }, [saved, myTotalPw, enemyTotalPw]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">バトル結果</h1>

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
        <p className="text-lg mb-2">👾 対戦相手：{enemy}</p>
        <h2 className="text-2xl font-bold mb-4 text-green-600">{getResultMessage()}</h2>

        <p className="mb-2">🧍‍♂️ あなたの攻撃PW：<span className="font-bold">{myTotalPw}</span></p>
        <p className="mb-2">👾 相手の攻撃PW：<span className="font-bold">{enemyTotalPw}</span></p>

        {saved && (
          <p className="mt-4 text-blue-700 font-bold">
            🎁 報酬として {reward} Bpt を獲得しました！
          </p>
        )}

        <button
          onClick={() => navigate("/battle/start")}
          className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          🔁 もう一度バトルする
        </button>
      </div>

      <div className="mt-6 w-full max-w-md">
        <h2 className="font-semibold mb-2">📜 バトルログ：</h2>
        <ul className="bg-white rounded p-4 shadow-md text-sm max-h-64 overflow-y-auto">
          {battleLog.map((log, index) => (
            <li key={index} className="mb-3 border-b pb-1">
              <strong>{log.round}回戦：</strong> {log.result}（{log.bet} PW）<br />
              {log.question !== "―" && (
                <>
                  問：{log.question} <br />
                  回答：{log.selected}（正解：{log.correct}）
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BattleResultPage;

