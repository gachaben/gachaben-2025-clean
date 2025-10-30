// ------------------------------------------------------
// 🏠 HomePage.jsx（ドレスタ / ガチャ弁 ホーム画面）
// ------------------------------------------------------
// - ThemeProvider による背景テーマ対応
// - ログイン後のメインメニュー（学習・チャレンジ・バトル・図鑑など）
// - 背景演出はテーマに応じて変化
// ------------------------------------------------------

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext"; // ✅ sなしに修正
import NoteBurst from "@/components/ui/NoteBurst";

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, themeName, setThemeName } = useTheme();

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden transition-all duration-700"
      style={{
        background: theme.background,
        color: theme.textColor,
      }}
    >
      {/* 🌈 背景エフェクト */}
      <NoteBurst mode="soft" quiet />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-white/20" />

      {/* 🎵 タイトル */}
      <motion.h1
        className="text-4xl font-bold mb-8 drop-shadow-lg z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🌟 ドレスタ ホーム
      </motion.h1>

      {/* 🔘 メニュー一覧 */}
      <div className="grid grid-cols-2 gap-6 z-10">
        <motion.button
          onClick={() => navigate("/study")}
          className="w-40 h-24 rounded-2xl shadow-lg font-bold text-lg hover:scale-105 transition"
          style={{ background: theme.accent, color: "#fff" }}
          whileTap={{ scale: 0.95 }}
        >
          📘 学習
        </motion.button>

        <motion.button
          onClick={() => navigate("/challenge")}
          className="w-40 h-24 rounded-2xl shadow-lg font-bold text-lg hover:scale-105 transition"
          style={{ background: "#facc15", color: "#222" }}
          whileTap={{ scale: 0.95 }}
        >
          ⚡ チャレンジ
        </motion.button>

        <motion.button
          onClick={() => navigate("/battle")}
          className="w-40 h-24 rounded-2xl shadow-lg font-bold text-lg hover:scale-105 transition"
          style={{ background: "#f87171", color: "#fff" }}
          whileTap={{ scale: 0.95 }}
        >
          🥊 バトル
        </motion.button>

        <motion.button
          onClick={() => navigate("/zukan")}
          className="w-40 h-24 rounded-2xl shadow-lg font-bold text-lg hover:scale-105 transition"
          style={{ background: "#60a5fa", color: "#fff" }}
          whileTap={{ scale: 0.95 }}
        >
          📚 図鑑
        </motion.button>
      </div>

      {/* 🪄 テーマ切り替え（開発・確認用） */}
      <div className="absolute bottom-8 flex gap-3 z-10">
        <button
          onClick={() => setThemeName("default")}
          className="px-3 py-2 bg-gray-200 rounded-lg text-sm"
        >
          🌤️ デフォルト
        </button>
        <button
          onClick={() => setThemeName("christmas")}
          className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm"
        >
          🎄 クリスマス
        </button>
        <button
          onClick={() => setThemeName("halloween")}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
        >
          🎃 ハロウィン
        </button>
        <button
          onClick={() => setThemeName("spring")}
          className="px-3 py-2 bg-pink-400 text-white rounded-lg text-sm"
        >
          🌸 春
        </button>
        <button
          onClick={() => setThemeName("summer")}
          className="px-3 py-2 bg-blue-400 text-white rounded-lg text-sm"
        >
          🌊 夏
        </button>
      </div>
    </div>
  );
}
