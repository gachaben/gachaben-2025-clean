// ------------------------------------------------------
// 🥊 BattlePlayPage.jsx（v3.8 / 延長戦対応＋正解のみ音符点灯 安定版）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { playNote, playFullScale } from "@/lib/useDoremiSound";
import NoteProgress from "@/components/ui/NoteProgress";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";

export default function BattlePlayPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isExtendMode = params.get("mode") === "extend"; // ✅ 延長戦フラグ

  // 問題数（通常7問、延長3問）
  const totalRounds = isExtendMode ? 3 : 7;

  const [round, setRound] = useState(0);
  const [userCorrect, setUserCorrect] = useState(0);
  const [cpuCorrect, setCpuCorrect] = useState(0);
  const [question, setQuestion] = useState(null);
  const [finished, setFinished] = useState(false);
  const [rainbow, setRainbow] = useState(false);

  const sampleQuestions = [
    { q: "1 + 2 = ?", a: 3 },
    { q: "5 - 2 = ?", a: 3 },
    { q: "3 × 3 = ?", a: 9 },
    { q: "10 - 4 = ?", a: 6 },
    { q: "8 ÷ 2 = ?", a: 4 },
    { q: "7 + 2 = ?", a: 9 },
    { q: "6 ÷ 3 = ?", a: 2 },
    { q: "9 - 5 = ?", a: 4 },
    { q: "2 + 3 = ?", a: 5 },
    { q: "4 + 4 = ?", a: 8 },
  ];

  const noteOrder = ["do", "re", "mi", "fa", "so", "ra", "si", "do2", "re2", "mi2"];

  useEffect(() => {
    setQuestion(sampleQuestions[round]);
  }, [round]);

  // 🎯 正答・誤答処理（不正解では音符もラウンドも進まない）
  const handleAnswer = (isCorrect) => {
    if (finished) return;

    let nextUser = userCorrect;
    let nextCpu = cpuCorrect;

    if (isCorrect) {
      // ✅ 正解時のみ進行
      nextUser++;
      playNote(noteOrder[nextUser - 1]);
      setUserCorrect(nextUser);
    } else {
      // ❌ 不正解時は音符も進行もしない（間違い音のみ再生）
      ["mi", "re", "do"].forEach((n, i) =>
        setTimeout(() => playNote(n), i * 120)
      );
      return; // ← 重要！ここでreturnする
    }

    // 🎯 CPUランダム正答（平均60%）
    const cpuAnswer = Math.random() < 0.6;
    if (cpuAnswer) nextCpu++;
    setCpuCorrect(nextCpu);

    // 🎯 終了判定
    if (round + 1 >= totalRounds) {
      setFinished(true);
      setTimeout(() => finishBattle(nextUser, nextCpu), 1000);
    } else {
      setRound((prev) => prev + 1);
    }
  };

  // 🎵 終了処理
  const finishBattle = async (user, cpu) => {
    const uid = "demoUser";
    const isWin = user > cpu;

    if (isExtendMode) {
      // 延長戦モード時の追加DP処理
      const extraGain = Math.floor(user * 2.5); // 例: 1正解=約2〜3DP
      await updateDoremiPoints(uid, extraGain);
      alert(`🌀 延長戦で +${extraGain} DP 獲得！`);
    }

    // 🌈 全問正解時のみファンファーレ
    if (user === totalRounds) {
      playFullScale();
      setRainbow(true);
    }

    // 結果ページへ遷移
    navigate("/battle/result", { state: { isWin, userScore: user, cpuScore: cpu } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 relative overflow-hidden text-center">
      <h2 className="text-2xl font-bold mb-4 mt-10">
        {isExtendMode ? "🌀 延長ステージ" : "🥊 ドレミバトル"}
      </h2>
      <p className="mb-2 text-lg">{`第 ${round + 1} 問 / ${totalRounds}`}</p>

      {/* スコア表示 */}
      <div className="flex gap-12 mb-6 text-lg font-semibold">
        <div className="text-pink-600">あなた：{userCorrect}問</div>
        <div className="text-blue-600">CPU：{cpuCorrect}問</div>
      </div>

      {/* 問題カード */}
      {!finished && question && (
        <motion.div
          className="bg-white rounded-3xl shadow-lg px-8 py-6 mb-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xl font-semibold mb-4">{question.q}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            {[question.a, question.a + 1, question.a - 1]
              .sort(() => Math.random() - 0.5)
              .map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt === question.a)}
                  className="bg-indigo-400 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl transition"
                >
                  {opt}
                </button>
              ))}
          </div>
        </motion.div>
      )}

      {/* ノートゲージ */}
      <NoteProgress current={userCorrect} isRainbow={rainbow} />

      {/* 結果表示 */}
      {finished && (
        <div className="mt-6 text-center">
          {userCorrect > cpuCorrect ? (
            <p className="text-xl font-bold text-indigo-600 animate-pulse">
              🌈 {isExtendMode ? "延長も勝利！" : "勝利！ドレミが響いた！"}
            </p>
          ) : (
            <p className="text-lg text-gray-600">CPUの勝利…！</p>
          )}
        </div>
      )}
    </div>
  );
}
