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

  // ✅ アイテムのマージとPW初期化
  useEffect(() => {
  console.log("📦 location.state:", state);
  console.log("🧩 state.selectedItem:", state?.selectedItem);

  if (!state?.selectedItem) return;
    console.log("📦 location.state:", state);
    console.log("🧩 state.selectedItem:", state.selectedItem);

  const raw = state.selectedItem;
  const merged = {
    ...raw,
    pw: raw.pw ?? 0,
    cpt: raw.cpt ?? 0,
    bpt: raw.bpt ?? 0,
  };

  setSelectedItem(merged);
  setSelectedPw(null);

// ✅ アイテムに紐づくPWを最初の所持PWとする
  setMyTotalPw(merged.pw ?? 0);
  console.log("✅ selectedItemの中身（BattlePage）:", merged);
}, [state]);


  // ✅ 問題セット
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

  useEffect(() => {
    setQuestion(allQuestions[(currentRound - 1) % allQuestions.length]);
  }, [currentRound]);

  // ✅ 回答処理
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

  const renderGauge = (label, value, max, color) => (
    <div className="text-center flex-1 mx-2">
      <p className="font-bold mb-1">{label}</p>
      <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm mt-1">{value} PW</p>
    </div>
  );

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
    <div className="min-h-screen bg-yellow-50 p-4">
      <h1 className="text-2xl font-bold text-center mb-2">
        バトル Round {currentRound} / {questionCount}
      </h1>

      <p className="text-center text-lg mb-2">
        🧑 あなた vs 👑 {enemy}
      </p>

      {/* PWゲージ */}
      <div className="flex justify-center items-center mb-4 gap-4 flex-wrap">
        {renderGauge("🧑 あなた", myTotalPw, 500, "bg-blue-400")}
        <span className="font-bold">VS</span>
        {renderGauge(`👑 ${enemy}`, enemyTotalPw, 500, "bg-purple-400")}
      </div>

      {/* キャラカード */}
      <div className="flex justify-center my-4">
        <ItemCard item={selectedItem} owned={true} />
      </div>

      {/* ステータス */}
      <div className="text-center text-sm text-gray-700 mb-4">
        <p>
          🥊 <span className="text-red-500 font-bold">攻撃力：</span> {selectedItem.cpt ?? 0}　
          💪 <span className="text-blue-500 font-bold">防御力：</span> {selectedItem.bpt ?? 0}
        </p>
      </div>

    
      {/* ✅ PW選択画面：selectedPwがまだ未選択のときだけ表示 */}

{selectedPw == null && (
  <div className="text-center my-4">
    <p className="text-blue-800 font-bold mb-2">
      あなたのターン！まず PW を選んでください
    </p>
    <div className="flex justify-center flex-wrap gap-2">
     {[100, 200, 300, 400, 500].map((pw) => {
  const isDisabled = pw > myTotalPw;
  return (
    <button
      key={pw}
      onClick={() => !isDisabled && setSelectedPw(pw)}
      disabled={isDisabled}
      className={`px-4 py-2 rounded-full border font-bold
        ${isDisabled
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


      {/* ✅ 問題表示 */}
      {selectedPw != null && question && (
        <div className="text-center mb-4">
          <p className="text-lg font-semibold mb-2">{question.text}</p>
          <div className="flex flex-col items-center gap-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="bg-white hover:bg-blue-100 px-6 py-2 rounded shadow"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* バトルログ */}
      <div className="mt-6 bg-white rounded p-4 shadow">
        <h2 className="font-bold mb-2">📜 バトルログ：</h2>
        {battleLog.map((log, idx) => (
          <p key={idx} className="text-sm">{log}</p>
        ))}
      </div>
    </div>
  );
};

export default BattlePage;
