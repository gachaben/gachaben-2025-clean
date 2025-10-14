// ------------------------------------------------------
// 📘 StudyPage.jsx（7問構成）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteProgress from "../components/ui/NoteProgress";
import { motion } from "framer-motion";

export default function StudyPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
  // Firestoreから問題を取得（仮）
  setQuestions([
    { q: "ドレミの歌で最初の音は？", choices: ["ド", "レ", "ミ"], answer: "ド" },
    { q: "ファの次は？", choices: ["ソ", "ミ", "ラ"], answer: "ソ" },
    { q: "ミの前は？", choices: ["ド", "レ", "ファ"], answer: "レ" },
    { q: "ドの次は？", choices: ["ミ", "レ", "ソ"], answer: "レ" },
    { q: "ラの次は？", choices: ["ソ", "シ", "ド"], answer: "シ" },
    { q: "シの次の音は？", choices: ["ド", "レ", "ラ"], answer: "ド" },
    { q: "音階の最初は？", choices: ["ド", "ソ", "ラ"], answer: "ド" },
  ]);
}, []);

  const handleAnswer = (choice) => {
    if (choice === questions[index].answer) {
      setCorrectCount((prev) => prev + 1);
    }
    if (index + 1 < questions.length) {
      setIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
      setTimeout(() => {
        if (correctCount + 1 >= 7) {
          navigate("/mission/complete");
        }
      }, 1200);
    }
  };

  if (!questions.length) return <p>読み込み中...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white text-center">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">📘 学習チャレンジ</h1>

      <NoteProgress current={correctCount} />

      {!showResult ? (
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-lg w-80"
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-lg mb-4">{questions[index].q}</p>
          {questions[index].choices.map((c, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(c)}
              className="block w-full my-2 py-2 bg-pink-400 text-white rounded-lg hover:bg-pink-500"
            >
              {c}
            </button>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold mt-4"
        >
          🎵 全問おわり！
        </motion.div>
      )}
    </div>
  );
}
