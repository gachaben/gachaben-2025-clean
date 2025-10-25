// ------------------------------------------------------
// 🌈 BattleResultPage.jsx（v2.1 サウンド＋演出連動版）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NoteBurst from "@/components/ui/NoteBurst";
import { motion } from "framer-motion";
import { playSfx, playFullScale } from "@/lib/soundPlayer";

export default function BattleResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isWin } = location.state || {};

  const [showSequence, setShowSequence] = useState(false);
  const [fadeToMorning, setFadeToMorning] = useState(false);

  // ✅ 勝敗に応じた音＆演出
  useEffect(() => {
    if (isWin) {
      // 🥊 勝利音 → 1秒後 NoteBurst → さらに全音ファンファーレ
      playSfx("battle_win");
      setTimeout(() => setShowSequence(true), 1000);
      setTimeout(() => playFullScale(), 1800);
    } else {
      // 😢 敗北時：やさしい音（wrong）＋フェード
      playSfx("wrong");
      setTimeout(() => setFadeToMorning(true), 3500);
    }
  }, [isWin]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center text-white">
      {/* 背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black z-0" />
      <div className="absolute inset-0 bg-[url('/images/stars_layer.png')] bg-cover opacity-70 animate-stars z-0" />

      {/* 🌈 音符演出 */}
      {showSequence && (
        <NoteBurst
          mode="sequence"
          labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
          intervalMs={350}
          waveDelayMs={600}
          type="study"
        />
      )}

      {/* タイトル */}
      <motion.h1
        className="text-3xl font-bold z-10 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {isWin ? "🎉 勝利おめでとう！" : "💫 また挑戦しよう！"}
      </motion.h1>

      {/* 戻るボタン */}
      <motion.button
        onClick={() => navigate("/home")}
        className="relative z-10 mt-8 px-6 py-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:scale-105 transition"
        whileTap={{ scale: 0.95 }}
      >
        ホームへ戻る
      </motion.button>

      {/* 🌅 朝フェード */}
      {fadeToMorning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-orange-100 via-sky-100 to-white z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          <motion.p
            className="text-2xl font-bold text-gray-700 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            🌅 新しい朝が始まります…
          </motion.p>
        </motion.div>
      )}

      {/* 星アニメ */}
      <style>{`
        @keyframes driftStars {
          0% { background-position: 0 0; }
          100% { background-position: -2000px 1000px; }
        }
        .animate-stars {
          animation: driftStars 120s linear infinite;
        }
      `}</style>
    </div>
  );
}
