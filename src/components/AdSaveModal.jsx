// ------------------------------------------------------
// 🎁 AdSaveModal.jsx（報酬型広告モーダル）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdSaveModal({ onClose, onFinish }) {
  const [status, setStatus] = useState("playing"); // playing | finished

  useEffect(() => {
    const timer = setTimeout(() => setStatus("finished"), 3000); // 3秒疑似広告
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 w-80 text-center shadow-xl"
      >
        {status === "playing" ? (
          <>
            <h2 className="text-xl font-bold mb-2">📺 広告を再生中...</h2>
            <p className="text-gray-600 mb-4">数秒お待ちください</p>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="mx-auto w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full"
            />
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-pink-600 mb-2">
              🎉 視聴ありがとう！
            </h2>
            <p className="text-gray-700 mb-4">ボーナス問題へ進めます！</p>
            <button
              onClick={onFinish}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600"
            >
              🎁 ボーナス問題へ
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
        >
          閉じる
        </button>
      </motion.div>
    </div>
  );
}
