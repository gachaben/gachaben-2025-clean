// ------------------------------------------------------
// ⚡ ChallengePage.jsx（v2.0 サウンド＋正解演出付き）
// ------------------------------------------------------
import React, { useState } from "react";
import { useHearts } from "@/context/HeartsContext";
import AdHeartModal from "@/components/AdHeartModal";
import useHeartGate from "@/hooks/useHeartGate";
import { playSfx } from "@/lib/soundPlayer";
import NoteBurst from "@/components/ui/NoteBurst";

export default function ChallengePage() {
  const { hearts } = useHearts();
  const [running, setRunning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showBurst, setShowBurst] = useState(false);
  const totalQuestions = 5; // ← 3〜5問単位で調整OK

  const { startWithHeart, adOpen, closeAd, watchAd, pending } = useHeartGate({
    onProceed: async () => {
      setRunning(true);
      setQuestionIndex(0);
      setCorrectCount(0);
      setShowBurst(false);
    },
  });

  // 仮問題セット
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
    } else {
      playSfx("wrong");
    }

    // 次の問題または終了処理
    if (questionIndex + 1 < totalQuestions) {
      setQuestionIndex((prev) => prev + 1);
    } else {
      // ✅ 全問終了時
      setRunning(false);
      if (correctCount + (isCorrect ? 1 : 0) === totalQuestions) {
        // 🌈 全問正解 → 演出
        setTimeout(() => {
          playSfx("clear_challenge");
          setShowBurst(true);
        }, 600);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-yellow-50 to-amber-100">
      <h1 className="text-2xl font-bold">⚡ チャレンジ</h1>
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
          <p className="text-lg font-semibold mb-2">
            {`第 ${questionIndex + 1} 問 / ${totalQuestions}`}
          </p>
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

      {/* 🌈 全問正解時：音符バースト */}
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
