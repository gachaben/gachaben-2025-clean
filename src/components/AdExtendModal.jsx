// ------------------------------------------------------
// 🟩 AdExtendModal.jsx（4〜6問正解用 / 延長チャレンジ）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import NaviBubble from "@/components/NaviBubble";

export default function AdExtendModal({ correctCount, onClose }) {
  const dpBonus = correctCount === 4 ? 1 : correctCount === 5 ? 2 : 3;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full relative"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* ナビキャラ */}
        <div className="mb-3">
          <NaviBubble
            message={`すごい！あと少しで満点だよ！🎵`}
            subMessage={`広告動画を見てボーナス問題にチャレンジしてみる？`}
          />
        </div>

        {/* スコア情報 */}
        <div className="text-lg font-bold mb-3">
          {correctCount}問正解 🎯 <br />
          ボーナス報酬 +{dpBonus} DP
        </div>

        {/* ボタン */}
        <button
          onClick={() => {
            // ✅ 広告再生シミュレーション
            alert("🎥 広告動画を再生中...");
            setTimeout(() => {
              alert("✅ 広告完了！ボーナス問題へ進みます。");
              onClose();
            }, 1200);
          }}
          className="mt-3 px-6 py-3 rounded-xl font-bold text-white bg-pink-500 hover:opacity-90 shadow"
        >
          🎥 広告を見て延長チャレンジへ！
        </button>

        <button
          onClick={() => onClose()}
          className="mt-4 block mx-auto text-sm text-gray-500 hover:text-gray-700 underline"
        >
          今回はやめておく
        </button>
      </motion.div>
    </motion.div>
  );
}
