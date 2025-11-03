// ------------------------------------------------------
// 🌈 ChallengeResultPage.jsx（チャレンジ結果）
// ------------------------------------------------------
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function ChallengeResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const cleared = query.get("cleared") === "true";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-sky-100 text-center">
      {cleared ? (
        <>
          <motion.h2
            className="text-3xl font-bold text-pink-600 mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🌈 チャレンジクリア！
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            虹がかかった！報酬ガチャが解放されました✨
          </motion.p>
          <motion.button
            onClick={() => navigate("/mission-gacha")}
            className="bg-gradient-to-r from-pink-400 to-orange-400 text-white px-8 py-3 rounded-2xl text-xl font-bold shadow-lg hover:scale-105 transition"
            whileTap={{ scale: 0.9 }}
          >
            🎰 報酬ガチャへ
          </motion.button>
        </>
      ) : (
        <>
          <motion.h2
            className="text-3xl font-bold text-gray-600 mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            😅 おしい！
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            間違えた問題だけもう一度チャレンジしよう！
          </motion.p>
          <motion.button
            onClick={() => navigate("/challenge/retry")}
            className="bg-gradient-to-r from-sky-400 to-blue-500 text-white px-8 py-3 rounded-2xl text-xl font-bold shadow-lg hover:scale-105 transition"
            whileTap={{ scale: 0.9 }}
          >
            🔁 再チャレンジ！
          </motion.button>
        </>
      )}
    </div>
  );
}
