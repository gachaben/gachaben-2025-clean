// ------------------------------------------------------
// 🥊 BattlePage.jsx（CPU対戦 / 7問中4先取 + 連続正解バナー対応）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import NoteProgress from "@/components/ui/NoteProgress";
import { playNote, playFullScale } from "@/lib/useDoremiSound";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { saveUserStreak } from "@/lib/firestoreStreak";

function CorrectStreakBanner({ streak }) {
  if (!streak || streak === 0) return null;

  const getStyle = () => {
    if (streak < 3) return "bg-indigo-200 text-indigo-800";
    if (streak < 5) return "bg-yellow-200 text-yellow-800";
    return "bg-pink-200 text-pink-800";
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 w-full py-2 text-center font-bold text-lg ${getStyle()} shadow-md z-50`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      🎵 {streak}問連続正解中！
    </motion.div>
  );
}

export default function BattlePage() {
  const navigate = useNavigate();
  const totalRounds = 7;
  const winThreshold = 4;

  const [round, setRound] = useState(0);
  const [userCorrect, setUserCorrect] = useState(0);
  const [cpuCorrect, setCpuCorrect] = useState(0);
  const [question, setQuestion] = useState(null);
  const [isRainbow, setIsRainbow] = useState(false);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  const sampleQuestions = [
    { q: "1 + 2 = ?", a: 3 },
    { q: "3 × 3 = ?", a: 9 },
    { q: "4 + 5 = ?", a: 9 },
    { q: "10 - 7 = ?", a: 3 },
    { q: "6 ÷ 2 = ?", a: 3 },
    { q: "8 - 3 = ?", a: 5 },
    { q: "2 + 4 = ?", a: 6 },
  ];

  const noteOrder = ["do", "re", "mi", "fa", "so", "ra", "si"];

  useEffect(() => {
    if (round < totalRounds) setQuestion(sampleQuestions[round]);
  }, [round]);

  const handleAnswer = (isCorrect) => {
    if (finished) return;

    let nextUser = userCorrect;
    let nextCpu = cpuCorrect;

    if (isCorrect) {
      nextUser++;
      setUserCorrect(nextUser);
      const newStreak = streak + 1;
      setStreak(newStreak);
      saveUserStreak(true);
      playNote(noteOrder[nextUser - 1]);
    } else {
      setStreak(0);
      saveUserStreak(false);
    }

    const cpuAnswer = Math.random() < 0.6;
    if (cpuAnswer) nextCpu++;
    setCpuCorrect(nextCpu);

    if (nextUser >= winThreshold || nextCpu >= winThreshold || round + 1 >= totalRounds) {
      const userWin = nextUser > nextCpu;
      const isDraw = nextUser === nextCpu;
      setFinished(true);

      if (isDraw) {
        setTimeout(() => navigate("/battle/timebreak"), 1200);
        return;
      }

      if (userWin) {
        setTimeout(() => {
          playFullScale();
          setIsRainbow(true);
        }, 600);
      }

      setTimeout(() => {
        navigate("/battle/result", {
          state: { isWin: userWin, totalWins: userWin ? 1 : 0 },
        });
      }, 3000);
    } else {
      setRound((prev) => prev + 1);
    }
  };

  const currentQ = sampleQuestions[round];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 relative overflow-hidden">
      <CorrectStreakBanner streak={streak} />

      <h2 className="text-2xl font-bold mb-4 mt-10">🥊 ドレミバトル</h2>
      <p className="mb-2 text-lg">{`第 ${round + 1} 問 / ${totalRounds}`}</p>

      <div className="flex gap-12 mb-6 text-lg font-semibold">
        <div className="text-pink-600">あなた：{userCorrect}問</div>
        <div className="text-blue-600">CPU：{cpuCorrect}問</div>
      </div>

      {!finished && (
        <div className="bg-white rounded-3xl shadow-lg px-8 py-6 mb-6 text-center">
          <p className="text-xl font-semibold mb-4">{currentQ?.q}</p>
          <div className="flex gap-4 justify-center">
            {[currentQ?.a, currentQ?.a + 1, currentQ?.a - 1]
              .sort(() => Math.random() - 0.5)
              .map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt === currentQ.a)}
                  className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl transition"
                >
                  {opt}
                </button>
              ))}
          </div>
        </div>
      )}

      <NoteProgress current={userCorrect} isRainbow={isRainbow} />

      {finished && (
        <div className="mt-6 text-center">
          {userCorrect > cpuCorrect ? (
            <p className="text-xl font-bold text-indigo-600 animate-pulse">
              🌈 勝利！ドレミが響いた！
            </p>
          ) : userCorrect === cpuCorrect ? (
            <p className="text-lg text-gray-600 animate-pulse">⏱️ 同点！タイブレークへ突入！</p>
          ) : (
            <p className="text-lg text-gray-600">CPUの勝利…！</p>
          )}
        </div>
      )}
    </div>
  );
}
