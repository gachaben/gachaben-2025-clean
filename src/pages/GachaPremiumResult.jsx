// ------------------------------------------------------
// 🎁 GachaPremiumResult.jsx（7回目確定当たり演出）
// ------------------------------------------------------
// 🌈 ドレミファソラシド×2 ＋ 虹波アニメーション
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteBurst from "@/components/ui/NoteBurst";
import { motion } from "framer-motion";

export default function GachaPremiumResult() {
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // 🎵 ファンファーレ音再生
  useEffect(() => {
    const audio = new Audio("/sounds/effects/gacha_complete.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {});
    setTimeout(() => setShowCongrats(true), 1000);

    // 🌅 3.5秒後 → 自動でホームへ遷移
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => navigate("/home"), 1500);
    }, 3500);

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-black">
      {/* 🌈 虹色背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-600 to-pink-500 animate-gradientMove"></div>

      {/* 🎶 7音 × 2 sequenceアニメ */}
      <NoteBurst
        mode="sequence"
        labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
        intervalMs={350}
        waveDelayMs={600}
        waveStepMs={90}
        type="study"
      />

      {/* ✨ カプセル演出 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <img
          src="/images/effects/rainbow_capsule.png"
          alt="capsule"
          className="w-40 h-40 mx-auto drop-shadow-2xl animate-bounceSlow"
        />
      </motion.div>

      {/* 🎉 Congratulations テキスト */}
      {showCongrats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 mt-8"
        >
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            🎉 Congratulations!!
          </h1>
          <p className="text-lg text-yellow-200 mt-2">
            プレミアムアイテムを獲得しました！
          </p>
        </motion.div>
      )}

      {/* 🌅 フェードアウト（帰還アニメ） */}
      {fadeOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 bg-gradient-to-b from-yellow-100 via-sky-100 to-white z-50 flex items-center justify-center"
        >
          <p className="text-2xl text-gray-700 font-bold animate-pulse">
            🌅 ホームへ戻ります…
          </p>
        </motion.div>
      )}

      {/* 🌈 カスタムCSS */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradientMove {
          background-size: 200% 200%;
          animation: gradientMove 6s ease infinite;
        }
        .animate-bounceSlow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
