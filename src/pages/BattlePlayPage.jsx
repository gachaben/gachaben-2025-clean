// ------------------------------------------------------
// ⚔️ BattlePlayPage.jsx（v8.4 / 上部吹き出し削除＋2段コメント構成）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdSaveModal from "../components/AdSaveModal";
import { useNavigate } from "react-router-dom";
import DoreminoBubble from "../components/DoreminoBubble";

export default function BattlePlayPage({ totalRounds = 7 }) {
  const [round, setRound] = useState(1);
  const [userCorrect, setUserCorrect] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [showAdBonus, setShowAdBonus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [praiseStep, setPraiseStep] = useState(1);
  const navigate = useNavigate();

  // 🎵 MP3再生
  const playSound = (path) => {
    const audio = new Audio(`/sounds/doremi/${path}`);
    audio.volume = 0.8;
    audio.play().catch((e) => console.warn("Audio play error:", e));
  };

  const questions = [
    { text: "8 + 3 = ?", options: ["9", "10", "11", "13"], answer: "11" },
    { text: "5 × 2 = ?", options: ["7", "10", "8", "12"], answer: "10" },
    { text: "6 − 1 = ?", options: ["4", "6", "5", "7"], answer: "5" },
    { text: "9 ÷ 3 = ?", options: ["6", "4", "3", "2"], answer: "3" },
    { text: "7 + 2 = ?", options: ["8", "9", "10", "11"], answer: "9" },
    { text: "4 × 3 = ?", options: ["10", "11", "12", "13"], answer: "12" },
    { text: "15 − 7 = ?", options: ["6", "7", "8", "9"], answer: "8" },
  ];

  const currentQ = questions[round - 1];

  // ✅ ラウンドごとにメッセージ更新
  const [message, setMessage] = useState("準備OK？");
  useEffect(() => {
    if (phase === "question") {
      setMessage(`第${round}問！ がんばって！`);
    }
  }, [round, phase]);

  // 🧮 回答処理
  const handleAnswer = (opt) => {
    const correct = opt === currentQ.answer;
    if (correct) setUserCorrect((v) => v + 1);
    if (round < totalRounds) {
      setTimeout(() => setRound((r) => r + 1), 500);
    } else {
      setTimeout(() => setPhase("finish"), 700);
    }
  };

  // 🎉 終了時の演出
  useEffect(() => {
    if (phase === "finish") {
      if (userCorrect === totalRounds) {
        playSound("doremi_full3.mp3");
        setTimeout(() => {
          setPraiseStep(2);
          setShowAdBonus(true);
        }, 1500);
      } else if (userCorrect >= 4) {
        playSound("doremi_full1.mp3");
        setTimeout(() => {
          setPraiseStep(2);
          setShowAdBonus(true);
        }, 1500);
      } else {
        playSound("do.mp3");
      }
    }
  }, [phase]);

  // 🎁 広告関係
  const handleWatchAd = () => setShowModal(true);
  const handleFinishAd = () => {
    setShowModal(false);
    const bonusCount = userCorrect === totalRounds ? 1 : userCorrect >= 4 ? 3 : 0;
    navigate("/battle/bonus", { state: { bonusCount } });
  };

  // 🌟 初期表示
  useEffect(() => {
    setTimeout(() => {
      setPhase("question");
      setMessage("第1問！ がんばって！");
    }, 800);
  }, []);

  // ---------------------------------------------------
  // 💡 表示
  // ---------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 to-orange-100 relative">
      <h2 className="text-2xl font-bold mb-2">⚔️ バトル（{totalRounds}問制）</h2>

      {/* 出題フェーズ */}
      {phase === "question" && currentQ && (
        <motion.div
          key={round}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center"
        >
          <p className="text-lg mb-3 font-semibold text-gray-700">{message}</p>
          <p className="text-xl font-bold mb-4">{currentQ.text}</p>
          <div className="grid grid-cols-2 gap-3">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 結果フェーズ */}
      {phase === "finish" && (
        <motion.div
          key="finish"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-10"
        >
          {/* 🎯 大見出しコメント */}
          {userCorrect === totalRounds && (
            <h2 className="text-3xl font-bold text-pink-600 mb-4">
              🌈 パーフェクト！おめでとう！
            </h2>
          )}
          {userCorrect >= 4 && userCorrect < totalRounds && (
            <h2 className="text-3xl font-bold text-pink-600 mb-4">
              🎵 ボーナス問題で再挑戦チャンス！
            </h2>
          )}
          {userCorrect < 4 && (
            <h2 className="text-3xl font-bold text-pink-600 mb-4">💭 がんばったね！</h2>
          )}

{/* 🎵 ドレミノ吹き出し */}
{userCorrect === totalRounds && (
  <DoreminoBubble
    type="perfect"
    message={
      <>
        すごいね！<br />
        ドレミがキラキラ光ってるよ！<br />
        １問５DPのボーナス問題にチャレンジしよう！
      </>
    }
  />
)}

{userCorrect >= 4 && userCorrect < totalRounds && (
  <DoreminoBubble
    type="good"
    message={
      <>
        あとちょっとでパーフェクト！<br />
        ボーナス問題で３DPをゲットしよう！
      </>
    }
  />
)}

{userCorrect < 4 && (
  <DoreminoBubble
    type="arere"
    message={
      <>
        がんばったね！<br />
        またチャレンジしよう！<br />
        応援してるよ📣
      </>
    }
  />
)}



         {/* 🎁 ボーナス誘導 */}
{showAdBonus && (
  <div className="flex flex-col items-center gap-3 mt-4">
    <button
      onClick={handleWatchAd}
      className="bg-orange-500 text-white px-6 py-4 rounded-xl shadow hover:bg-orange-600 text-base font-semibold leading-snug text-center"
    >
      🎁 広告を見てボーナス問題に挑戦しよう！
    </button>

    <button
      onClick={() => window.location.reload()}
      className="text-blue-600 underline text-sm mt-2"
    >
      あとで
    </button>
  </div>
)}

        </motion.div>
      )}

      {/* 🎬 広告モーダル */}
      {showModal && (
        <AdSaveModal onClose={() => setShowModal(false)} onFinish={handleFinishAd} />
      )}
    </div>
  );
}
