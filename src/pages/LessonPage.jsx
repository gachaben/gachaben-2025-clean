// ------------------------------------------------------
// 📘 LessonPage.jsx（教科書学習モード / 小単元3問）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import NoteProgress from "@/components/ui/NoteProgress";
import { playNote, playFullScale } from "@/lib/useDoremiSound";

export default function LessonPage() {
  const [current, setCurrent] = useState(0); // 正解数
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isRainbow, setIsRainbow] = useState(false);

  // 仮の3問セット（サンプル）
  const questions = [
    { q: "1 + 2 = ?", a: 3 },
    { q: "4 - 1 = ?", a: 3 },
    { q: "2 + 3 = ?", a: 5 },
  ];

  // ✅ 正解時の処理
  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      const next = current + 1;
      setCurrent(next);

      // 🎵 ド・レ・ミ の順に再生
      const noteOrder = ["do", "re", "mi"];
      playNote(noteOrder[next - 1]);

      // 💫 全問正解ならご褒美演出
      if (next === 3) {
        setTimeout(() => {
          playFullScale(); // ドレミファソラシド×2
          setIsRainbow(true); // 虹アニメON
        }, 600);
      }
    }

    // 次の問題へ
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      console.log("✅ 小単元クリア！");
    }
  };

  const currentQ = questions[questionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-sky-200">
      <h2 className="text-2xl font-bold mb-4">📘 小単元モード</h2>
      <p className="text-lg mb-4">{`第 ${questionIndex + 1} 問`}</p>

      {/* 問題カード */}
      <div className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6">
        <p className="text-xl font-semibold mb-4">{currentQ.q}</p>
        <div className="flex gap-4">
          {[currentQ.a, currentQ.a + 1, currentQ.a - 1]
            .sort(() => Math.random() - 0.5)
            .map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt === currentQ.a)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-xl"
              >
                {opt}
              </button>
            ))}
        </div>
      </div>

      {/* 🎵 ドレミ進行ゲージ */}
      <NoteProgress current={current} isRainbow={isRainbow} />

      {/* 🌈 全音点灯時メッセージ */}
      {isRainbow && (
        <p className="text-xl font-bold text-pink-600 animate-pulse mt-2">
          🌈 小単元クリア！ドレミが響いた！
        </p>
      )}
    </div>
  );
}
