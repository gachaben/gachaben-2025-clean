import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { enemy, questionCount } = state || {};

  const [selectedItem, setSelectedItem] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedPw, setSelectedPw] = useState(null);
  const [myTotalPw, setMyTotalPw] = useState(300);
  const [enemyTotalPw, setEnemyTotalPw] = useState(500);
  const [battleLog, setBattleLog] = useState([]);
  const [question, setQuestion] = useState(null);

  // ✁EselectedItem めEstate からマ�Eジして保持
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

    console.log("selectedItemの中身�E�EattlePage�E�E", merged);
    console.log("攻撁E�� (cpt)�E�E, merged.cpt || 0);
    console.log("防御劁E(bpt)�E�E, merged.bpt || 0);
  }, [state]);

  // ✁E問題データ�E�例！E
  const allQuestions = [
    {
      text: "カブトムシの幼虫が食べるものは�E�E,
      options: ["木の葁E, "腐葉圁E, "果物"],
      answer: "腐葉圁E,
    },
    {
      text: "セミ�E鳴き声は�E�E,
      options: ["ミ�Eンミ�Eン", "チュンチュン", "ケロケロ"],
      answer: "ミ�Eンミ�Eン",
    },
    {
      text: "トンボ�E羽はぁE��つ�E�E,
      options: ["2极E, "4极E, "6极E],
      answer: "4极E,
    },
  ];

  useEffect(() => {
    setQuestion(allQuestions[(currentRound - 1) % allQuestions.length]);
  }, [currentRound]);

  const handleAnswer = (option) => {
    if (!selectedPw || !question) return;

    const correct = option === question.answer;
    const log = correct
      ? `✁E正解�E�E{selectedPw}PW刁E相手にダメージ�E�`
      : `❁E不正解…攻撁E��きなかった`;

    if (correct) {
      setEnemyTotalPw((prev) => Math.max(prev - selectedPw, 0));
    }

    setBattleLog((prev) => [...prev, `Round ${currentRound}�E�E{log}`]);

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
          ⚠�E�Eキャラが選ばれてぁE��せん
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

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <h1 className="text-2xl font-bold text-center mb-2">
        バトル Round {currentRound} / {questionCount}
      </h1>

      <p className="text-center text-lg mb-2">
        🧁EあなぁEvs 👑 {enemy}
      </p>

      <div className="flex justify-center items-center mb-4 gap-4 flex-wrap">
        {renderGauge("🧁EあなぁE, myTotalPw, 500, "bg-blue-400")}
        <span className="font-bold">VS</span>
        {renderGauge(`👑 ${enemy}`, enemyTotalPw, 500, "bg-purple-400")}
      </div>

      {/* アイチE��カード表示 */}
      <div className="flex justify-center my-4">
        <ItemCard item={selectedItem} owned={true} />
      </div>

      <div className="text-center text-sm text-gray-700 mb-4">
        <p>
          🥁E<span className="font-bold text-red-500">攻撁E���E�E/span>{selectedItem.cpt ?? 0}　
          💪 <span className="font-bold text-blue-500">防御力！E/span>{selectedItem.bpt ?? 0}
        </p>
      </div>

      {/* ✁EPW選択�Eタン�E�questionがなくても表示 */}
      {!selectedPw && (
        <>
          <p className="text-center text-blue-800 font-bold mb-2">
            あなた�Eターン�E�まぁEPW を選んでください
          </p>
          <div className="flex justify-center mb-4 flex-wrap gap-2">
            {[100, 200, 300, 400, 500].map((pw) => (
              <button
                key={pw}
                onClick={() => setSelectedPw(pw)}
                className={`px-4 py-2 rounded-full border font-bold ${
                  selectedPw === pw
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500 border-blue-500"
                }`}
              >
                {pw} PW
              </button>
            ))}
          </div>
        </>
      )}

      {/* ✁E問題と選択肢�E�EW選択後に表示�E�E*/}
      {selectedPw && question && (
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

      <div className="mt-6 bg-white rounded p-4 shadow">
        <h2 className="font-bold mb-2">📜 バトルログ�E�E/h2>
        {battleLog.map((log, idx) => (
          <p key={idx} className="text-sm">
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BattlePage;
