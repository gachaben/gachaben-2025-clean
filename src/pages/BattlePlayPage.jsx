import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const BattlePlayPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { selectedItem, enemyItem, myBet, enemyBet, questionCount = 3 } = state || {};

  const [myAnswers, setMyAnswers] = useState([]);
  const [cpuAnswers, setCpuAnswers] = useState([]);
  const [myAnswerText, setMyAnswerText] = useState(null);
  const [cpuAnswerText, setCpuAnswerText] = useState(null);
  const [cpuAnswerCorrect, setCpuAnswerCorrect] = useState(null);
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

  useEffect(() => {
    if (isMyTurnDone) {
      const simulateCpu = () => {
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

      <div className="flex flex-col md:flex-row justify-center items-start gap-4 mt-6">
        {/* 自分側 */}
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-center font-bold text-blue-600">🧑‍🎓 あなた</h2>
          <ItemCard item={selectedItem} owned={true} />
          <p className="text-center mt-2 font-semibold text-sm">PWベット中</p>
          <div className="mt-4">
            <p className="text-center mb-2 font-semibold">{question.text}</p>
            <div className="flex flex-col items-center gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleMyAnswer(opt)}
                  className={`px-4 py-2 rounded shadow w-3/4
                    ${myAnswerText === opt ? "bg-blue-400 text-white" : "bg-white hover:bg-blue-100"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 相手側 */}
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-center font-bold text-purple-600">👑 カブトムシくん</h2>
          <ItemCard item={enemyItem} owned={false} />
          <p className="text-center mt-2 font-semibold text-sm">PWベット中</p>
          <p className="text-center mt-4">{question.text}</p>
          <div className="flex flex-col items-center gap-2 mt-2">
            {question.options.map((opt) => (
              <div
                key={opt}
                className={`px-4 py-2 rounded w-3/4 text-center
                  ${cpuAnswerText === opt ? "bg-purple-400 text-white" : "bg-gray-100"}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattlePlayPage;
console.log("🟣 LIVE BattlePlayPage.jsx", import.meta.url);