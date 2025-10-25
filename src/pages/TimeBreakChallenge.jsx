// ------------------------------------------------------
// ⏱️ TimeBreakChallenge.jsx（タイブレーク10秒チャレンジ / 最終版）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { playNote, playFullScale } from "@/lib/useDoremiSound";
import NoteProgress from "@/components/ui/NoteProgress";
import { useNavigate } from "react-router-dom";
import "@/styles/TimeBreakChallenge.css";

export default function TimeBreakChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("cpu"); // "cpu" | "user" | "result"
  const [cpuScore, setCpuScore] = useState(0);
  const [targetScore, setTargetScore] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [current, setCurrent] = useState(0);
  const [isRainbow, setIsRainbow] = useState(false);

  const notes = ["do", "re", "mi", "fa", "so", "ra", "si"];

  // 🎮 CPUチャレンジ（スコアを徐々に上げる演出）
  useEffect(() => {
    if (phase === "cpu") {
      const randomTarget = Math.floor(Math.random() * 5) + 3; // 3〜7問
      setTargetScore(randomTarget);
      let tempScore = 0;

      const interval = setInterval(() => {
        tempScore++;
        setCpuScore(tempScore);
        if (tempScore >= randomTarget) {
          clearInterval(interval);
          setTimeout(() => setPhase("user"), 1000);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [phase]);

  // ⏱️ ユーザー10秒カウントダウン
  useEffect(() => {
    if (phase === "user" && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (phase === "user" && countdown === 0) {
      setPhase("result");
    }
  }, [phase, countdown]);

  // 🎯 ユーザー回答処理
  const handleAnswer = (isCorrect) => {
    if (phase !== "user") return;
    if (isCorrect) {
      const next = userScore + 1;
      setUserScore(next);
      setCurrent(next);
      playNote(notes[next - 1]);
    }
  };

  // 🌈 結果処理
  useEffect(() => {
    if (phase === "result") {
      const win = userScore > cpuScore;

      if (win) {
        setTimeout(() => {
          playFullScale();
          setIsRainbow(true);
        }, 500);

        setTimeout(() => {
          navigate("/battle/result", { state: { isWin: true } });
        }, 3500);
      } else {
        setTimeout(() => {
          navigate("/battle/result", { state: { isWin: false } });
        }, 2500);
      }
    }
  }, [phase, userScore, cpuScore, navigate]);

  // --------------------------------------------------
  // 💡 表示部分
  // --------------------------------------------------
  return (
    <div className="timebreak-container bg-gradient-to-b from-purple-100 to-indigo-200 min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">⏱️ タイブレークチャレンジ</h2>

      {/* CPUターン */}
      {phase === "cpu" && (
        <div className="phase-cpu animate-pulse">
          <p className="text-lg mb-2">CPUがチャレンジ中…</p>
          <div className="text-5xl font-bold text-indigo-700 transition-all duration-300">
            {cpuScore} 問 正解！
          </div>
        </div>
      )}

      {/* ユーザーターン */}
      {phase === "user" && (
        <>
          <p className="timer mb-3">残り時間：{countdown}秒</p>
          <div className="bg-white rounded-3xl shadow-lg px-8 py-6 mb-6 text-center">
            <p className="text-xl font-semibold mb-4">3 + 4 = ?</p>
            <div className="btn-area">
              {[7, 8, 6].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt === 7)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <NoteProgress current={current} isRainbow={isRainbow} />
        </>
      )}

      {/* 結果表示 */}
      {phase === "result" && (
        <div className="phase-result text-center mt-6">
          <p className="text-lg mb-2">
            あなた：{userScore}問　｜　CPU：{cpuScore}問
          </p>
          {userScore > cpuScore ? (
            <p className="win text-2xl font-bold animate-pulse">
              🌈 勝利！ドレミが響いた！
            </p>
          ) : (
            <p className="lose text-xl font-semibold">CPUの勝利…</p>
          )}
        </div>
      )}
    </div>
  );
}
