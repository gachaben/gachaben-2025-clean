// ------------------------------------------------------
// 🌅 AppOpeningScene.jsx（完全削除フェードアウト版）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { playSfx } from "@/lib/soundPlayer";

export default function AppOpeningScene() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("night");
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 🌅 起動音
    playSfx("opening_theme");

    // 🌙→🌅→☀️ の3段階
    setTimeout(() => setPhase("sunrise"), 1500);
    setTimeout(() => setPhase("day"), 4000);

    // 🌅 → フェードアウト → Homeへ遷移
    const fadeTimer = setTimeout(() => setFadeOut(true), 5500);
    const navTimer = setTimeout(() => {
      setVisible(false);
      navigate("/home");
    }, 6500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  // ✅ DOMから完全削除
  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-hidden text-center transition-opacity duration-1000 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ zIndex: 9999, pointerEvents: "none" }}
    >
      {/* 🌌 背景レイヤー */}
      <div
        className={`absolute inset-0 transition-all duration-[2000ms] ${
          phase === "night"
            ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-black"
            : phase === "sunrise"
            ? "bg-gradient-to-b from-orange-200 via-pink-200 to-blue-200"
            : "bg-gradient-to-b from-sky-200 via-blue-100 to-white"
        }`}
        style={{ pointerEvents: "none" }}
      />

      {/* 🌈 タイトル */}
      <motion.h1
        className="z-10 text-4xl font-bold text-white drop-shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        style={{ pointerEvents: "none" }}
      >
        🎶 ドレミスタディ
      </motion.h1>

      {/* 🌠 星 */}
      {phase === "night" && (
        <div
          className="absolute inset-0 bg-[url('/images/stars_layer.png')] bg-cover opacity-70 animate-stars"
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* ☀️ 太陽 */}
      {phase !== "night" && (
        <motion.div
          className="absolute top-1/3 left-1/2 w-32 h-32 bg-yellow-300 rounded-full shadow-lg"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          style={{ pointerEvents: "none" }}
        />
      )}

      {/* 🌠 星アニメーション */}
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
