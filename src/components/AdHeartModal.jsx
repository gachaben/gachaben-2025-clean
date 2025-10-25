import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdRewardModal({ show, onClose, onAdComplete }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (show) {
      // モーダルが開かれたら動画再生をシミュレーション
      setTimeout(() => {
        setPlaying(true);
        console.log("🎥 Ad started");
        // 3秒後に広告完了としてコールバック
        setTimeout(() => {
          console.log("✅ Ad complete");
          setPlaying(false);
          onAdComplete && onAdComplete();
          onClose && onClose();
        }, 3000);
      }, 800);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ad-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-[2000]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm text-center"
          >
            <h2 className="text-xl font-bold mb-4">🎥 広告視聴中...</h2>
            {playing ? (
              <div className="animate-pulse text-blue-500 font-semibold">
                広告再生中（3秒）...
              </div>
            ) : (
              <div className="text-gray-400 italic">準備中...</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
