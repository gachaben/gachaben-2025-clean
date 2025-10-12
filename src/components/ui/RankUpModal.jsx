// ------------------------------------------------------
// 🎵 RankUpModal.jsx（v2.1 最前面表示対応）
// ------------------------------------------------------
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function RankUpModal({ show, oldRank, newRank, onClose }) {
  useEffect(() => {
    if (show) {
      console.log("🎹 Rank Up Effect Triggered!", oldRank, "→", newRank);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-[200000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl text-center w-[320px] border-4 border-pink-200"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="text-3xl mb-4 font-bold text-pink-500">
              🎹 ランクアップ！
            </div>
            <div className="text-xl mb-4">
              {oldRank && (
                <span className="text-gray-500 mr-2">{oldRank}</span>
              )}
              →
              <span className="text-pink-500 ml-2">{newRank}</span>
            </div>
            <div className="text-2xl mb-6 text-indigo-500">🎵🎶</div>
            <div className="text-gray-600 mb-6">おめでとうございます！</div>
            <button
              onClick={onClose}
              className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-full shadow-md transition"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
