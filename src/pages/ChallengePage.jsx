// ------------------------------------------------------
// ⚡ ChallengePage.jsx（v2.1 🎵連続正解バナー対応版）
// ------------------------------------------------------
import React, { useState } from "react";
import { useHearts } from "@/context/HeartsContext";
import AdHeartModal from "@/components/AdHeartModal";
import useHeartGate from "@/hooks/useHeartGate";
import { playSfx } from "@/lib/soundPlayer";
import NoteBurst from "@/components/ui/NoteBurst";
import { motion } from "framer-motion";
import { saveUserStreak } from "@/lib/firestoreStreak";

function CorrectStreakBanner({ streak }) {
  if (!streak || streak === 0) return null;

  const getStyle = () => {
    if (streak < 3) return "bg-amber-200 text-amber-800";
    if (streak < 5) return "bg-yellow-300 text-yellow-900";
    return "bg-orange-300 text-orange-900";
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

export default function ChallengePage() {
  const { hearts } = useHearts();
  const [running, setRunning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const totalQuestions = 5;

  const { startWithHeart, adOpen, closeAd, watchAd, pending } = useHeartGate({
    onProceed: async () => {
      setRunning(true);
      setQuestionIndex(0);
      setCorrectCount(0);
      setStreak(0);
      setShowBurst(false);
    },
  });

  const sampleQuestions = [
    { q: "5 + 3 = ?", a: 8 },
    { q: "10 - 7 = ?", a: 3 },
    { q: "4 × 2 = ?", a: 8 },
    { q: "12 ÷ 3 = ?", a: 4 },
    { q: "9 - 2 = ?", a: 7 },
  ];

  const current = sampleQuestions[questionIndex];

  const handleAnswer = (opt) => {
    if (!running) return;
    const isCorrect = opt === current.a;

    if (isCorrect) {
      playSfx("correct");
      setCorrectCount((c) => c + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      saveUserStreak(true);
    } else {
      playSfx("wrong");
      setStreak(0);
      saveUserStreak(false);
    }

    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      setRunning(false);
      if (correctCount + (isCorrect ? 1 : 0) === totalQuestions) {
        setTimeout(() => {
          playSfx("clear_challenge");
          setShowBurst(true);
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-yellow-50 to-amber-100 relative overflow-hidden">
      <CorrectStreakBanner streak={streak} />

      <h1 className="text-2xl font-bold mt-10">⚡ チャレンジ</h1>
      <div>現在のハート：<b>{hearts}</b></div>

      {!running && (
        <button
          disabled={pending}
          onClick={startWithHeart}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-500 rounded-lg font-bold shadow disabled:opacity-60"
        >
          ▶️ スタート（ハート1消費）
        </button>
      )}

      {running && (
        <div className="bg-white rounded-2xl shadow-lg px-8 py-6 text-center">
          <p className="text-lg font-semibold mb-2">{`第 ${questionIndex + 1} 問 / ${totalQuestions}`}</p>
          <p className="text-xl font-bold mb-4">{current.q}</p>
          <div className="flex gap-4 justify-center">
            {[current.a, current.a + 1, current.a - 1]
              .sort(() => Math.random() - 0.5)
              .map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  className="bg-amber-300 hover:bg-amber-400 text-white px-6 py-2 rounded-xl transition"
                >
                  {opt}
                </button>
              ))}
          </div>
        </div>
      )}

      {!running && correctCount > 0 && (
        <div className="text-lg font-bold text-green-600 animate-pulse">
          {correctCount === totalQuestions
            ? "🌈 全問正解！チャレンジ達成！"
            : `スコア：${correctCount}/${totalQuestions}`}
        </div>
      )}

      {showBurst && (
        <NoteBurst
          mode="sequence"
          labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
          intervalMs={350}
          waveDelayMs={600}
          type="study"
        />
      )}

      <AdHeartModal open={adOpen} onClose={closeAd} onWatch={watchAd} />
    </div>
  );
}
