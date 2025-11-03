// ------------------------------------------------------
// 🎥 AdStageModal.jsx（v1.0 / 救済・延長・ボーナス統合版）
// ------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdStageModal({
  isOpen,
  type, // "save" | "extend" | "bonus"
  onAdComplete,
  onClose,
}) {
  if (!isOpen) return null;

  const config = {
    save: {
      title: "❤️ 続けよう！リズムは止まらない！",
      desc: "広告を見れば、次の問題に進めるよ！",
      button: "🎥 広告を見て再開する",
      color: "bg-red-100 text-red-700",
      icon: "❤️",
    },
    extend: {
      title: "🌀 あと少し！延長ステージに挑戦！",
      desc: "広告を見れば、延長3問に挑戦できるよ！",
      button: "🎥 広告を見て延長戦へ！",
      color: "bg-blue-100 text-blue-700",
      icon: "🌀",
    },
    bonus: {
      title: "🌟 完璧！ごほうび問題に挑戦！",
      desc: "広告を見れば、ボーナス問題に挑戦できるよ！",
      button: "🎥 広告を見てごほうび問題へ！",
      color: "bg-yellow-100 text-yellow-700",
      icon: "🌟",
    },
  }[type];

  const handleWatchAd = () => {
    // ✅ 広告視聴完了イベント呼び出し
    onAdComplete?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`rounded-3xl shadow-2xl p-8 w-[90%] max-w-md text-center ${config.color}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120 }}
        >
          <div className="text-5xl mb-4">{config.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
          <p className="mb-6 text-base">{config.desc}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleWatchAd}
              className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
            >
              {config.button}
            </button>
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              ✖ 閉じる
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
