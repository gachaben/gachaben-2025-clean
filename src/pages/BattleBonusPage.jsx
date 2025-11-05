// ------------------------------------------------------
// 🎁 BattleBonusPage.jsx（v1.0 / 1問・3問対応）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function BattleBonusPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const bonusCount = state?.bonusCount || 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [message, setMessage] = useState("🎁 ボーナス問題に挑戦！");
  const [phase, setPhase] = useState("question"); // question | result

  // ✅ サンプル問題（仮データ）
  const allQuestions = [
    {
      text: "10 + 5 = ?",
      options: ["13", "14", "15", "16"],
      answer: "15",
    },
    {
      text: "4 × 2 = ?",
      options: ["6", "8", "9", "10"],
      answer: "8",
    },
    {
      text: "9 − 3 = ?",
      options: ["5", "6", "7", "8"],
      answer: "6",
    },
    {
      text: "3 + 7 = ?",
      options: ["9", "10", "11", "12"],
      answer: "10",
    },
    {
      text: "6 ÷ 2 = ?",
      options: ["2", "3", "4", "5"],
      answer: "3",
    },
  ];

  // 出題セットをランダムで抽出
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, bonusCount));
  }, [bonusCount]);

  // ✅ 回答処理
  const handleAnswer = (opt) => {
    const currentQ = questions[currentIndex];
    const isCorrect = opt === currentQ.answer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setMessage("🎯 正解！すごい！");
    } else {
      setMessage("❌ 残念！次いこう！");
    }

    if (currentIndex + 1 < questions.length) {
      setTimeout(() => {
        setMessage(`第${currentIndex + 2}問！がんばって！`);
        setCurrentIndex((i) => i + 1);
      }, 800);
    } else {
      setTimeout(() => {
        setPhase("result");
      }, 1000);
    }
  };

  // ✅ DP報酬計算
  const totalDP = correctCount * 1 + (bonusCount === 1 ? 4 : 0); // 1問時は5DP、3問時は1DP×正解数

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 p-4">
      <h2 className="text-2xl font-bold mb-4">🎁 ボーナス問題チャレンジ</h2>

      {phase === "question" && questions.length > 0 && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center"
        >
          <p className="text-lg font-bold text-gray-700 mb-3">{message}</p>
          <p className="text-xl font-semibold mb-4">
            {questions[currentIndex].text}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {questions[currentIndex].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500"
              >
                {opt}
              </button>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-4">
            第 {currentIndex + 1} 問 / 全 {bonusCount} 問
          </p>
        </motion.div>
      )}

      {phase === "result" && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white rounded-2xl shadow-lg p-8 mt-6 w-80"
        >
          <h3 className="text-2xl font-bold text-pink-600 mb-2">
            🎉 おめでとう！
          </h3>
          <p className="text-lg mb-4">
            {bonusCount}問中 {correctCount}問正解！
          </p>
          <p className="text-xl font-bold text-yellow-500 mb-4">
            💎 DP +{totalDP}
          </p>

          <button
            onClick={() => navigate("/")}
            className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600"
          >
            ホームへ戻る
          </button>
        </motion.div>
      )}
    </div>
  );
}
