// ------------------------------------------------------
// ☀️ LoginPage.jsx（朝フェード明けの夜明けバージョン）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoteBurst from "../components/ui/NoteBurst";
import { motion } from "framer-motion";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showButton, setShowButton] = useState(false);
  const [audio] = useState(() => new Audio("/sounds/morning_birds.mp3")); // 鳥の声

  useEffect(() => {
    // 鳥の声再生（フェード後）
    audio.volume = 0.6;
    const timer1 = setTimeout(() => {
      audio.play().catch(() => {}); // モバイルでもエラー回避
    }, 800);

    // スタートボタン出現
    const timer2 = setTimeout(() => setShowButton(true), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-gradient-to-b from-orange-100 via-sky-100 to-white">
      {/* ☀️ 朝日（光の流れ） */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-top bg-no-repeat opacity-40 animate-light z-0" />

      {/* 🌈 光のグラデーション */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-pink-100 to-sky-100 opacity-30 animate-glow z-0" />

      {/* 🎵 音符sequence（夜明けの音） */}
      <NoteBurst
        mode="sequence"
        labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
        intervalMs={400}
        waveDelayMs={600}
        waveStepMs={80}
        type="study"
      />

      {/* 🌅 タイトル */}
      <motion.h1
        className="relative z-10 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 drop-shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        DORESTA 🌅
      </motion.h1>

      {/* 💬 サブタイトル */}
      <motion.p
        className="relative z-10 mt-2 text-lg text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        今日も音が生まれる世界へ。
      </motion.p>

      {/* 🎮 スタートボタン */}
      {showButton && (
        <motion.button
          onClick={() => navigate("/home")}
          className="relative z-10 mt-10 px-8 py-3 bg-pink-500 text-white text-lg rounded-full shadow-lg hover:bg-pink-600 transition"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          スタート！
        </motion.button>
      )}

      <style>{`
        @keyframes lightFlow {
          0% { background-position: 0 top; opacity: 0.3; }
          50% { background-position: 100px top; opacity: 0.7; }
          100% { background-position: 0 top; opacity: 0.3; }
        }
        @keyframes morningGlow {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        .animate-light { animation: lightFlow 12s ease-in-out infinite; }
        .animate-glow { animation: morningGlow 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LoginPage;
