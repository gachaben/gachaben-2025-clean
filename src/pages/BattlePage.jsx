// src/pages/BattlePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const PW_OPTIONS = [100, 200, 300, 400, 500];

const BattlePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { enemy, questionCount } = state || {};

  const [selectedItem, setSelectedItem] = useState(null);

  // ラウンド & PW
  const [currentRound, setCurrentRound] = useState(1);
  const [myTotalPw, setMyTotalPw] = useState(300);
  const [enemyTotalPw, setEnemyTotalPw] = useState(500);

  // 今ラウンドの賭け
  const [enemySelectedPw, setEnemySelectedPw] = useState(null);
  const [mySelectedPw, setMySelectedPw] = useState(null);

  // 進行フェーズ
  // enemyPick → myPick → question（回答中）→ next（内部用）
  const [phase, setPhase] = useState("enemyPick");

  // 問題
  const [question, setQuestion] = useState(null);
  const [battleLog, setBattleLog] = useState([]);

  // CPUの回答
  const [enemyAnswer, setEnemyAnswer] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);

  // ダミー問題
  const allQuestions = [
    { text: "カブトムシの幼虫が食べるものは？", options: ["木の葉", "腐葉土", "果物"], answer: "腐葉土" },
    { text: "セミの鳴き声は？", options: ["ミーンミーン", "チュンチュン", "ケロケロ"], answer: "ミーンミーン" },
    { text: "トンボの羽はいくつ？", options: ["2枚", "4枚", "6枚"], answer: "4枚" },
  ];

  // 自分アイテム（簡易マージ）
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
    setMyTotalPw(merged.pw ?? 0);
  }, [state]);

  // ラウンド開始：相手PW→自分PW
  useEffect(() => {
    setEnemySelectedPw(null);
    setMySelectedPw(null);
    setEnemyAnswer(null);
    setMyAnswer(null); 
    setPhase("enemyPick");

    const enemyChoices = PW_OPTIONS.filter((p) => p <= enemyTotalPw);
    const pick = enemyChoices.length ? enemyChoices[Math.floor(Math.random() * enemyChoices.length)] : 0;

    const t = setTimeout(() => {
      setEnemySelectedPw(pick);
      setPhase("myPick");
    }, 600);

    return () => clearTimeout(t);
  }, [currentRound, enemyTotalPw]);

  // ラウンドの問題
  useEffect(() => {
    setQuestion(allQuestions[(currentRound - 1) % allQuestions.length]);
  }, [currentRound]);

  // ★ 以前の「phase===questionでCPU即回答するuseEffect」は削除しています

  // 1本化ゲージ + 今回の賭け表示
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
          <div className="bg-blue-400 h-full" style={{ width: `${myRatio * 100}%` }} />
          <div className="bg-purple-400 h-full" style={{ width: `${enemyRatio * 100}%` }} />
        </div>
        <div className="mt-2 flex justify-center gap-3 text-xs">
          <span className="px-2 py-1 rounded-full bg-blue-100 border border-blue-300">
            🧑 あなたの賭け：{mySelectedPw ?? "未選択"} PW
          </span>
          <span className="px-2 py-1 rounded-full bg-purple-100 border border-purple-300">
            👑 相手の賭け：{enemySelectedPw ?? "選択中…"} PW
          </span>
        </div>
      </div>
    );
  };

 const handleAnswer = (option) => {
  if (phase !== "question" || mySelectedPw == null || enemySelectedPw == null || !question) return;

  setPhase("freeze");         // 表示は残すがボタンは無効化
  setMyAnswer(option);        // 自分の選択をハイライト

  setTimeout(() => {
    const enemyPick = question.options[Math.floor(Math.random() * question.options.length)];
    setEnemyAnswer(enemyPick);

    setTimeout(() => {
      const myCorrect = option === question.answer;
      const enemyCorrect = enemyPick === question.answer;

      if (myCorrect) setEnemyTotalPw((prev) => Math.max(prev - mySelectedPw, 0));
      if (enemyCorrect && enemySelectedPw) setMyTotalPw((prev) => Math.max(prev - enemySelectedPw, 0));

      setBattleLog((prev) => [
        ...prev,
        `Round ${currentRound}：あなた ${myCorrect ? "○" : "×"} / 相手 ${enemyCorrect ? "○" : "×"}`,
      ]);

      setTimeout(() => {
        if (currentRound < questionCount) setCurrentRound((prev) => prev + 1);
        else navigate("/battle/result", { state: { myTotalPw, enemyTotalPw } });
      }, 700);
    }, 800);
  }, 1000);
};


  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold text-red-600 mb-4">⚠️ キャラが選ばれていません</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded shadow" onClick={() => navigate("/battle/item-select")}>
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

      {/* 上：相手 */}
      <div className="flex flex-col items-center bg-purple-50 p-2 rounded shadow">
        <ItemCard item={{ name: decodeURIComponent(enemy) }} owned />
        <p className="text-sm mt-1">👑 {decodeURIComponent(enemy)}</p>
        <p className="text-xs text-gray-600 mb-1">
          {phase === "enemyPick" ? "相手がPWを選択中…" : `相手の賭け：${enemySelectedPw ?? 0} PW`}
        </p>
        <p className="text-xs text-gray-700">🥊 攻撃力：—　💪 防御力：—</p>

      {/* 相手側にも同じ問題表示（CPUの選択をハイライト） */}
{/* 相手側にも同じ問題表示（CPUの選択をハイライト） */}
{(phase === "question" || phase === "freeze") && question && (
  <div className="text-center mb-1 w-full mt-2">
    <p className="text-sm font-semibold mb-1">{question.text}</p>
    <div className="flex flex-col items-center gap-1">
      {question.options.map((opt) => (
        <button
          key={opt}
          disabled
          className={`px-4 py-1 rounded shadow text-sm border
            ${enemyAnswer === opt
              ? "bg-purple-400 text-white border-purple-500"
              : "bg-white text-gray-700 border-gray-300"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
)}


      </div>

      {/* 中央：ゲージ */}
      {renderUnifiedGauge(myTotalPw, enemyTotalPw)}

      {/* 下：自分 */}
      <div className="flex flex-col items-center bg-blue-50 p-2 rounded shadow">
        <ItemCard item={selectedItem} owned />
        <p className="text-sm mt-1">🧑 あなた</p>
        <p className="text-xs text-gray-700">🥊 攻撃力：{selectedItem.cpt ?? 0}　💪 防御力：{selectedItem.bpt ?? 0}</p>

        {phase === "myPick" && (
          <div className="text-center my-2">
            <p className="text-blue-800 font-bold mb-1">あなたのターン！PW を選んでください</p>
            <div className="flex justify-center flex-wrap gap-2">
              {PW_OPTIONS.map((pw) => {
                const disabled = pw > myTotalPw;
                return (
                  <button
                    key={pw}
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      setMySelectedPw(pw);
                      setPhase("question");
                    }}
                    className={`px-3 py-1 rounded-full border font-bold text-sm ${
                      disabled
                        ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                        : mySelectedPw === pw
                        ? "bg-blue-500 text-white border-blue-500"
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

        {/* 自分の問題・選択肢 */}
{/* 自分の問題・選択肢 */}
{(phase === "question" || phase === "freeze") && question && (
  <div className="text-center mb-2 w-full">
    <p className="text-sm font-semibold mb-1">{question.text}</p>
    <div className="flex flex-col items-center gap-1">
      {question.options.map((opt) => (
        <button
          key={opt}
          onClick={() => handleAnswer(opt)}
          disabled={phase !== "question"}  // 押した後はfreezeで無効化
          className={`px-4 py-1 rounded shadow text-sm border
            ${myAnswer === opt
              ? "bg-blue-400 text-white border-blue-500"
              : "bg-white hover:bg-blue-100 border-gray-300"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
)}


      </div>

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