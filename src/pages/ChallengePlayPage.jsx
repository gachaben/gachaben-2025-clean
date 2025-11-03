// ------------------------------------------------------
// 🌈 ChallengePlayPage.jsx（チャレンジ問題モード / 結果遷移対応 完全版）
// ------------------------------------------------------
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { playNote } from "@/lib/useDoremiSound";
import AdSaveModal from "@/components/modals/AdSaveModal";


export default function ChallengePlayPage() {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ ページ遷移用
  const query = new URLSearchParams(location.search);
  const subject = query.get("subject") || "general";

  // ✅ 状態管理
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showRainbow, setShowRainbow] = useState(false);
  const [answers, setAnswers] = useState([]); // ✅ 回答履歴を記録
  const [showAdModal, setShowAdModal] = useState(false); // ✅ 広告モーダル制御
  const [wrongQuestions, setWrongQuestions] = useState([]); // ✅ 間違い問題

  // ✅ 仮の問題セット（スプレッドシート連携可）
  const questionSet = [
    { q: "ミの前は？", a: "レ" },
    { q: "ソの次は？", a: "ラ" },
    { q: "ドの次は？", a: "レ" },
  ];

  const currentQ = questionSet[questionIndex];

  // ✅ 回答処理
  const handleAnswer = (choice) => {
    // 最新の回答履歴を即時確定
    const updatedAnswers = [...answers, choice];
    setAnswers(updatedAnswers);

    const isCorrect = choice === currentQ.a;

    // ✅ 音演出
    if (isCorrect) {
      ["do", "re", "mi"].forEach((n, i) =>
        setTimeout(() => playNote(n), i * 150)
      );
      setCorrectCount((prev) => prev + 1);
    } else {
      ["mi", "re", "do"].forEach((n, i) =>
        setTimeout(() => playNote(n), i * 150)
      );

      // ✅ 不正解時：広告モーダルを表示
      setWrongQuestions([currentQ]);
      setShowAdModal(true);
    }

    // ✅ 最後の問題かチェック
    const isLast = questionIndex + 1 === questionSet.length;

    if (isLast) {
      setFinished(true);

      // ✅ 最新正答数を即時計算
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const cleared = finalCorrect === questionSet.length;

      if (cleared) setShowRainbow(true);

      // ✅ 間違い問題を抽出（即時 answers 使用）
      const wrongs = questionSet
        .filter((q, idx) => q.a !== updatedAnswers[idx])
        .map((q) => q.q);

      // ✅ ページ遷移（少し間を置く）
      setTimeout(() => {
        if (cleared) {
          navigate(`/challenge/result?cleared=true`);
        } else {
          navigate(`/challenge/retry`, { state: { wrongs } });
        }
      }, 1500);
    } else {
      // ✅ 次の問題へ
      setQuestionIndex((prev) => prev + 1);
    }
  };

  // ✅ 画面描画
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-pink-100 to-orange-100">
      {/* 🌈 ごほうび虹（柔らかい自然光Ver） */}
      {showRainbow && (
        <motion.div
          className="pointer-events-none absolute top-0 left-0 w-full h-[60vh] z-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0, 1, 0.9],
            scale: [0.9, 1.02, 1],
            rotate: [0, -1, 1, 0],
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(120deg, rgba(255,0,0,0.45), rgba(255,165,0,0.45), rgba(255,255,0,0.45), rgba(0,255,0,0.45), rgba(0,191,255,0.45), rgba(0,0,255,0.45), rgba(148,0,211,0.45))",
            filter:
              "blur(25px) saturate(1.5) brightness(1.05) drop-shadow(0 0 10px rgba(255,255,255,0.3))",
            borderRadius: "50% / 30%",
            transform: "rotate(-10deg) translateY(-10%)",
            opacity: 0.85,
          }}
        />
      )}

      {/* 🏷️ タイトル */}
      <motion.h2
        className="text-3xl font-bold text-pink-600 mb-4 mt-12 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🌟 チャレンジ問題！
      </motion.h2>

      <p className="text-gray-700 mb-6 z-10">{`第 ${questionIndex + 1} 問`}</p>

      {/* ✏️ 問題カード */}
      <motion.div
        className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold mb-4">{currentQ.q}</p>
        <div className="flex gap-4 justify-center flex-wrap">
          {["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"].map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-xl text-lg font-bold transition shadow-md"
              whileTap={{ scale: 0.9 }}
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 🌈 結果メッセージ */}
      {finished && (
        <motion.div
          className="relative z-20 text-xl font-bold text-pink-600 animate-pulse mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {showRainbow
            ? "🌈 チャレンジクリア！虹がかかった！"
            : "また挑戦してみよう！"}
        </motion.div>
      )}

      {/* 🎥 広告モーダル */}
      <AdSaveModal
        show={showAdModal}
        onClose={() => setShowAdModal(false)}
        wrongs={wrongQuestions}
      />
    </div>
  );
}
