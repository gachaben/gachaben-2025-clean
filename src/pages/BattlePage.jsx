import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { enemy, questionCount } = state || {};

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPw, setSelectedPw] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [myTotalPw, setMyTotalPw] = useState(300);
  const [enemyTotalPw, setEnemyTotalPw] = useState(500);
  const [battleLog, setBattleLog] = useState([]);
  const [question, setQuestion] = useState(null);

  // 質問データ（ダミー）
  const allQuestions = [
    {
      text: "カブトムシの幼虫が食べるものは？",
      options: ["木の葉", "腐葉土", "果物"],
      answer: "腐葉土",
    },
    {
      text: "セミの鳴き声は？",
      options: ["ミーンミーン", "チュンチュン", "ケロケロ"],
      answer: "ミーンミーン",
    },
    {
      text: "トンボの羽はいくつ？",
      options: ["2枚", "4枚", "6枚"],
      answer: "4枚",
    },
  ];

  // 選択アイテムの初期化
  useEffect(() => {
    if (!state?.selectedItem) return;
    const raw = state.selectedItem;
    const merged = {
      ...raw,
      pw: raw.pw ?? 0,
      cpt: raw.cpt ?? 0,
      bpt: raw.bpt ?? 0,
    };
    setSelectedItem(merged);
    setSelectedPw(null);
    setMyTotalPw(merged.pw ?? 0);
  }, [state]);

  // 現在のラウンドの質問をセット
  useEffect(() => {
    setQuestion(allQuestions[(currentRound - 1) % allQuestions.length]);
  }, [currentRound]);

  // 統合ゲージ
  const renderUnifiedGauge = (myPw, enemyPw) => {
    const total = myPw + enemyPw;
    const myRatio = total === 0 ? 0.5 : myPw / total;
    const enemyRatio = total === 0 ? 0.5 : enemyPw / total;

    return (
      <div className="text-center w-full max-w-md mx-auto mb-2">
        <div className="flex justify-between text-sm font-bold px-2 mb-1">
          <span>🧑 あなた：{myPw} PW</span>
          <span>👑 {decodeURIComponent(enemy)}：{enemyPw} PW</span>
        </div>
        <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden relative flex">
          <div
            className="bg-blue-400 h-full"
            style={{ width: `${myRatio * 100}%` }}
          ></div>
          <div
            className="bg-purple-400 h-full"
            style={{ width: `${enemyRatio * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // 回答処理
  const handleAnswer = (option) => {
    if (!selectedPw || !question) return;

    const correct = option === question.answer;
    const log = correct
      ? `✅ 正解！${selectedPw}PW分 相手にダメージ！`
      : `❌ 不正解…攻撃できなかった`;

    if (correct) {
      setEnemyTotalPw((prev) => Math.max(prev - selectedPw, 0));
    }

    setBattleLog((prev) => [...prev, `Round ${currentRound}：${log}`]);

    if (currentRound < questionCount) {
      setCurrentRound((prev) => prev + 1);
      setSelectedPw(null);
    } else {
      setTimeout(() => {
        navigate("/battle/result", {
          state: {
            myTotalPw,
            enemyTotalPw,
          },
        });
      }, 1000);
    }
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold text-red-600 mb-4">
          ⚠️ キャラが選ばれていません
        </p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
          onClick={() => navigate("/battle/item-select")}
        >
          キャラを選びに行く
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-2 flex flex-col">
     <h1 className="text-xl font-bold text-center mb-1">
     バトル Round {currentRound} / {questionCount}
     </h1>

     {/* 上下分割 */}
     <div className="flex-1 flex flex-col md:flex-col gap-4">
     {/* 上：相手 */}
     <div className="flex flex-col items-center bg-purple-50 p-2 rounded shadow">
     <ItemCard item={{ name: decodeURIComponent(enemy) }} owned={true} />
     <p className="text-sm mt-1">👑 {decodeURIComponent(enemy)}</p>
  </div>

  {/* ★ 中央：ゲージ（ここに移動） */}
  {renderUnifiedGauge(myTotalPw, enemyTotalPw)}

  {/* 下：自分 */}
  <div className="flex flex-col items-center bg-blue-50 p-2 rounded shadow">
    <ItemCard item={selectedItem} owned={true} />
    <p className="text-sm mt-1">🧑 あなた</p>
    <p className="text-xs text-gray-700">
      🥊 攻撃力：{selectedItem.cpt ?? 0}　
      💪 防御力：{selectedItem.bpt ?? 0}
    </p>
  </div>
</div>


      {/* PW選択 or 問題表示 */}
      {selectedPw == null && (
        <div className="text-center my-2">
          <p className="text-blue-800 font-bold mb-1">
            あなたのターン！PW を選んでください
          </p>
          <div className="flex justify-center flex-wrap gap-2">
            {[100, 200, 300, 400, 500].map((pw) => {
              const isDisabled = pw > myTotalPw;
              return (
                <button
                  key={pw}
                  onClick={() => !isDisabled && setSelectedPw(pw)}
                  disabled={isDisabled}
                  className={`px-3 py-1 rounded-full border font-bold text-sm ${
                    isDisabled
                      ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                      : "bg-white text-blue-500 border-blue-500 hover:bg-blue-100"
                  }`}
                >
                  {pw} PW
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedPw != null && question && (
        <div className="text-center mb-2">
          <p className="text-sm font-semibold mb-1">{question.text}</p>
          <div className="flex flex-col items-center gap-1">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="bg-white hover:bg-blue-100 px-4 py-1 rounded shadow text-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* バトルログ */}
      <div className="mt-2 bg-white rounded p-2 shadow text-xs">
        <h2 className="font-bold mb-1">📜 バトルログ：</h2>
        {battleLog.map((log, idx) => (
          <p key={idx}>{log}</p>
        ))}
      </div>
    </div>
  );
};

export default BattlePage;

