// ------------------------------------------------------
// ❤️ src/components/battle/ReviveModal.jsx
// ドレミチャレンジバトル：復活チャンス（広告 or カード）
// ------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviveModal({ onRevive, onClose, hasReviveCard }) {
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
          className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center relative overflow-hidden"
        >
          {/* ❤️ 見出し */}
          <motion.h2
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-bold text-pink-500"
          >
            もういちど続ける？
          </motion.h2>

          {/* 🎵 アニメーション（ふわふわ音符） */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: Math.random() * 160 - 80, y: 160, opacity: 0 }}
                animate={{
                  y: -80 - Math.random() * 80,
                  opacity: [0, 1, 0],
                  x: `+=${Math.random() * 40 - 20}`,
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  delay: i * 0.3,
                  repeat: Infinity,
                }}
                className="absolute text-lg"
                style={{
                  left: "50%",
                  color: ["#f472b6", "#facc15", "#60a5fa"][i % 3],
                }}
              >
                ♪
              </motion.div>
            ))}
          </div>

          {/* 🩷 メッセージ */}
          <p className="mt-4 text-gray-700 text-sm">
            コンボをキープして挑戦を続けることができるよ！
          </p>

          {/* ボタン群 */}
          <div className="flex flex-col gap-3 mt-6">
            {/* ▶️ 広告復活 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRevive}
              className="py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-400 shadow-md"
            >
              ▶️ 動画を見て復活する
            </motion.button>

            {/* 🩷 カード復活（所持時のみ） */}
            {hasReviveCard && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRevive}
                className="py-2 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-400 to-yellow-400 shadow-md"
              >
                🩷 復活カードで復活
              </motion.button>
            )}

            {/* ❌ あきらめる */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="py-2 rounded-xl font-semibold text-gray-600 bg-gray-100 border border-gray-300"
            >
              ❌ あきらめる
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

