// ------------------------------------------------------
// 📘 LessonPage.jsx（教科書学習モード / 小単元3問 + 連続正解バナー対応版）
// ------------------------------------------------------
import React, { useState } from "react";
import NoteProgress from "@/components/ui/NoteProgress";
import { playNote, playFullScale } from "@/lib/useDoremiSound";
import { motion } from "framer-motion";
import { saveUserStreak } from "@/lib/firestoreStreak";

// ✅ 連続正解バナー
function CorrectStreakBanner({ streak }) {
  if (!streak || streak === 0) return null;

  const getStyle = () => {
    if (streak < 3) return "bg-sky-200 text-sky-800";
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

export default function LessonPage() {
  const [current, setCurrent] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRainbow, setIsRainbow] = useState(false);

  const questions = [
    { q: "1 + 2 = ?", a: 3 },
    { q: "4 - 1 = ?", a: 3 },
    { q: "2 + 3 = ?", a: 5 },
  ];

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      const next = current + 1;
      setCurrent(next);

      const newStreak = streak + 1;
      setStreak(newStreak);
      saveUserStreak(true); // ✅ Firestore更新

      const noteOrder = ["do", "re", "mi"];
      playNote(noteOrder[next - 1]);

      if (next === 3) {
        setTimeout(() => {
          playFullScale();
          setIsRainbow(true);
        }, 600);
      }
    } else {
      setStreak(0);
      saveUserStreak(false); // ❌ 不正解時リセット
    }

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      console.log("✅ 小単元クリア！");
    }
  };

  const currentQ = questions[questionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-sky-200 relative overflow-hidden">
      <CorrectStreakBanner streak={streak} />

      <h2 className="text-2xl font-bold mb-4 mt-10">📘 小単元モード</h2>
      <p className="text-lg mb-4">{`第 ${questionIndex + 1} 問`}</p>

      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6 text-center">
        <p className="text-xl font-semibold mb-4">{currentQ.q}</p>
        <div className="flex gap-4 justify-center">
          {[currentQ.a, currentQ.a + 1, currentQ.a - 1]
            .sort(() => Math.random() - 0.5)
            .map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt === currentQ.a)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl text-lg font-bold transition"
              >
                {opt}
              </button>
            ))}
        </div>
      </div>

      <NoteProgress current={current} isRainbow={isRainbow} />

      {isRainbow && (
        <motion.p
          className="text-xl font-bold text-pink-600 animate-pulse mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🌈 小単元クリア！ドレミが響いた！
        </motion.p>
      )}
    </div>
  );
}
