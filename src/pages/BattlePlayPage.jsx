import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattlePlayPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { selectedItem, enemyItem, myBet, enemyBet, questionCount = 3 } = state || {};

  const [myAnswers, setMyAnswers] = useState([]);
  const [cpuAnswers, setCpuAnswers] = useState([]);
  const [myAnswerText, setMyAnswerText] = useState(null);         // 🆕 自分の解答表示用
  const [cpuAnswerText, setCpuAnswerText] = useState(null);       // 🆕 CPUの解答表示用
  const [cpuAnswerCorrect, setCpuAnswerCorrect] = useState(null); // 🆕 CPUの正誤
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [isMyTurnDone, setIsMyTurnDone] = useState(false);
  const [isCpuTurnDone, setIsCpuTurnDone] = useState(false);

  const allQuestions = [
    {
      text: "セミの鳴き声は？",
      options: ["ミーンミーン", "チュンチュン", "ケロケロ"],
      answer: "ミーンミーン",
    },
    {
      text: "カブトムシの幼虫が食べるものは？",
      options: ["木の葉", "腐葉土", "果物"],
      answer: "腐葉土",
    },
    {
      text: "トンボの羽はいくつ？",
      options: ["2枚", "4枚", "6枚"],
      answer: "4枚",
    },
  ];

  useEffect(() => {
    setQuestion(allQuestions[currentQuestionIndex]);
  }, [currentQuestionIndex]);

  const handleMyAnswer = (option) => {
    const isCorrect = option === question.answer;
    setMyAnswers((prev) => [...prev, isCorrect]);
    setMyAnswerText(option);
    setIsMyTurnDone(true);
  };

  // ✅ CPUの疑似解答
  useEffect(() => {
    if (isMyTurnDone) {
      const simulateCpu = () => {
        const correctRate = 0.7;
        const delay = 1000 + Math.random() * 2000;

        setTimeout(() => {
          const options = question.options;
          const randomAnswer = options[Math.floor(Math.random() * options.length)];
          const isCorrect = randomAnswer === question.answer;

          setCpuAnswerText(randomAnswer);
          setCpuAnswerCorrect(isCorrect);
          setCpuAnswers((prev) => [...prev, isCorrect]);
          setIsCpuTurnDone(true);
        }, delay);
      };

      simulateCpu();
    }
  }, [isMyTurnDone]);

  // ✅ 両者回答後 → 次の問題 or 結果へ
  useEffect(() => {
    if (isMyTurnDone && isCpuTurnDone) {
      const next = currentQuestionIndex + 1;
      if (next < questionCount) {
        setTimeout(() => {
          setCurrentQuestionIndex(next);
          setIsMyTurnDone(false);
          setIsCpuTurnDone(false);
          setMyAnswerText(null);
          setCpuAnswerText(null);
          setCpuAnswerCorrect(null);
        }, 1500);
      } else {
        const myCorrect = myAnswers.filter((x) => x).length;
        const cpuCorrect = cpuAnswers.filter((x) => x).length;

        const winner =
          myCorrect > cpuCorrect
            ? "player"
            : cpuCorrect > myCorrect
            ? "cpu"
            : "draw";

        navigate("/battle/result", {
          state: {
            myBet,
            enemyBet,
            winner,
            myCorrect,
            cpuCorrect,
            selectedItem,
            enemyItem,
          },
        });
      }
    }
  }, [isCpuTurnDone, isMyTurnDone]);

  if (!question) return <p>問題を読み込み中...</p>;

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <h1 className="text-xl font-bold text-center mb-4">
        Round {currentQuestionIndex + 1} / {questionCount}
      </h1>

      <div className="flex justify-center gap-8 flex-wrap">
        {/* 左側（あなた） */}
        <div className="w-72 bg-white rounded shadow p-4">
          <h2 className="text-center font-bold text-blue-600 mb-2">🧑 あなた</h2>
          <ItemCard item={selectedItem} owned={true} />
          <p className="text-sm text-center mt-2 text-gray-500">{myBet} PWベット中</p>
          <p className="font-semibold mt-2">{question.text}</p>
          <div className="flex flex-col gap-2 mt-2">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleMyAnswer(opt)}
                disabled={isMyTurnDone}
                className={`px-4 py-2 rounded border text-left ${
                  isMyTurnDone
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {isMyTurnDone && myAnswerText && (
            <p className="mt-2 text-center text-sm font-bold">
              選択：{myAnswerText}{" "}
              {myAnswerText === question.answer ? (
                <span className="text-green-500">✅</span>
              ) : (
                <span className="text-red-500">❌</span>
              )}
            </p>
          )}
        </div>

        {/* 右側（CPU） */}
        <div className="w-72 bg-white rounded shadow p-4">
          <h2 className="text-center font-bold text-purple-600 mb-2">👑 カブトムシくん</h2>
          <ItemCard item={enemyItem} owned={false} />
          <p className="text-sm text-center mt-2 text-gray-500">{enemyBet} PWベット中</p>
          <p className="font-semibold mt-2">{question.text}</p>

          <div className="h-24 flex justify-center items-center mt-2">
            {isMyTurnDone ? (
              isCpuTurnDone ? (
                <p className="text-sm font-bold">
                  選択：{cpuAnswerText}{" "}
                  {cpuAnswerCorrect ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-red-500">❌</span>
                  )}
                </p>
              ) : (
                <p className="text-gray-500 animate-pulse">🤔 解答中...</p>
              )
            ) : (
              <p className="text-gray-400">待機中...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePlayPage;
