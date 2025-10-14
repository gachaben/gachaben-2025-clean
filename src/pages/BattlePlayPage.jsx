// ------------------------------------------------------
// ⚔️ BattlePlayPage.jsx（青空ドレミバトル／昼フェーズ）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NoteBurst from "../components/ui/NoteBurst";
import { motion } from "framer-motion";

const BattlePlayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { doubleReward = false } = location.state || {};

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const questions = [
    { q: "『ドレミ』の最初の音は？", a: "ド" },
    { q: "ファの次は？", a: "ソ" },
    { q: "シの前は？", a: "ラ" },
    { q: "ドの１オクターブ上は？", a: "ド" },
    { q: "ミの次は？", a: "ファ" },
    { q: "ラの次は？", a: "シ" },
    { q: "ソの前は？", a: "ファ" },
  ];

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);

    if (questionIndex + 1 >= questions.length) {
      setIsFinished(true);
      setTimeout(() => {
        navigate("/battle/result", {
          state: { isWin: score + (isCorrect ? 1 : 0) >= 4, doubleReward },
        });
      }, 1000);
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center">
      {/* ☀️ 背景（昼の青空＋光） */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-white z-0" />
      <div className="absolute inset-0 bg-[url('/images/clouds_light.png')] bg-repeat-x bg-bottom opacity-70 animate-clouds z-0" />

      {/* 🌤 光の層（上から流れる） */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-top bg-no-repeat opacity-40 animate-light z-0" />

      {/* 🎵 2倍中バッジ */}
      {doubleReward && (
        <motion.div
          className="absolute top-4 right-4 bg-pink-500 text-white font-bold px-4 py-2 rounded-full shadow-md z-10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          🔥 ポイント2倍中！
        </motion.div>
      )}

      {/* 🪄 問題ボード */}
      <motion.div
        className="relative z-10 mt-10 bg-white/80 backdrop-blur-md px-8 py-6 rounded-3xl shadow-xl max-w-md"
        key={questionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-lg text-gray-700 mb-2">
          第 {questionIndex + 1} 問
        </p>
        <p className="text-2xl font-bold text-blue-600 mb-6">
          {questions[questionIndex].q}
        </p>
        <div className="flex justify-center space-x-6">
          <button
            onClick={() => handleAnswer(true)}
            className="px-6 py-2 bg-green-400 text-white rounded-xl shadow hover:bg-green-500 transition"
          >
            正解！
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl shadow hover:bg-gray-400 transition"
          >
            ミス！
          </button>
        </div>
        <p className="mt-4 text-sm text-gray-500">スコア：{score}</p>
      </motion.div>

      {/* 🎵 正解時に軽く音符が舞う */}
      {score > 0 && <NoteBurst mode="burst" quiet key={score} />}

      {/* 🌤 スタイル */}
      <style>{`
        @keyframes moveClouds {
          0% { background-position: 0 bottom; }
          100% { background-position: 1200px bottom; }
        }
        @keyframes lightFlow {
          0% { background-position: 0 top; opacity: 0.3; }
          50% { background-position: 100px top; opacity: 0.6; }
          100% { background-position: 0 top; opacity: 0.3; }
        }
        .animate-clouds { animation: moveClouds 80s linear infinite; }
        .animate-light { animation: lightFlow 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default BattlePlayPage;
