// ------------------------------------------------------
// 🎹 RankUpModal.jsx（v3.0 / ModalContainer統合＋虹演出）
// ------------------------------------------------------
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModalContainer from "@/components/modals/ModalContainer";
import { playFullScale } from "@/lib/useDoremiSound";

export default function RankUpModal({ isOpen, newRank, prevRank, onClose }) {
  useEffect(() => {
    if (isOpen) playFullScale(); // 称号アップ時にドレミ音
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalContainer type="rankup">
          {/* 🎹 テキスト */}
          <motion.h2
            className="text-3xl font-bold text-indigo-700"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            🎹 称号アップ！
          </motion.h2>

          <p className="text-gray-700 mt-3">
            {prevRank} → <span className="text-pink-600 font-bold">{newRank}</span>
          </p>

          {/* 🎵 鍵盤アニメーション */}
          <div className="mt-8 flex justify-center gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-8 h-24 bg-white border border-gray-300 rounded-sm shadow-md"
                initial={{ opacity: 0.5, y: 10 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  y: [10, -10, 10],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>

          {/* 💬 ペップトーク */}
          <motion.p
            className="mt-6 text-pink-600 font-semibold italic text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            きみの努力が、音になったね🎵
          </motion.p>

          {/* ✅ ボタン */}
          <button
            onClick={onClose}
            className="mt-8 bg-pink-500 hover:bg-pink-600 text-white py-2 px-6 rounded-xl font-bold shadow-md transition"
          >
            OK
          </button>
        </ModalContainer>
      </motion.div>
    </AnimatePresence>
  );
}
