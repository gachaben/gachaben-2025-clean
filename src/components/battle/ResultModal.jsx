// ------------------------------------------------------
// 🌈 src/components/battle/ResultModal.jsx
// ドレミチャレンジバトル：ドレミファソラシド完成演出
// ------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResultModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center text-center overflow-hidden"
        >
          {/* 🌈 タイトル */}
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 to-sky-400"
          >
            🎉 ドレミファソラシド完成！
          </motion.h2>

          {/* 🎶 虹色音符アニメーション */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * 200 - 100,
                  y: 200,
                  opacity: 0,
                }}
                animate={{
                  y: -120 - Math.random() * 100,
                  opacity: [0, 1, 0],
                  x: `+=${Math.random() * 40 - 20}`,
                }}
                transition={{
                  duration: 2.5 + Math.random(),
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="absolute text-2xl"
                style={{
                  left: "50%",
                  color: ["#f472b6", "#facc15", "#60a5fa", "#22c55e"][
                    i % 4
                  ],
                }}
              >
                ♪
              </motion.div>
            ))}
          </div>

          {/* 🌟 メッセージ */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-gray-700 font-medium"
          >
            ドレミポイントをゲット！  
            つぎのメロディを奏でよう♪
          </motion.p>

          {/* 🔘 ボタン群 */}
          <div className="flex gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-400 shadow-md"
            >
              🔁 もういちど
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-400 to-cyan-400 shadow-md"
            >
              🏠 ホームへ
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
