// ------------------------------------------------------
// 🟦 AdPerfectModal.jsx（7問全問正解用 / スペシャルボーナス）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import NaviBubble from "@/components/NaviBubble";

export default function AdPerfectModal({ onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-gradient-to-b from-yellow-100 to-yellow-300 rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full relative border-4 border-yellow-400"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* ナビキャラ */}
        <div className="mb-3">
          <NaviBubble
            message="フルコンボ！！🔥"
            subMessage="激アツボーナス問題に挑戦する！？（広告視聴で解放）"
          />
        </div>

        {/* スコア情報 */}
        <div className="text-lg font-bold mb-3 text-yellow-800">
          完全勝利おめでとう！🎉 <br />
          ボーナス報酬 +5 DP ＋ 音符 +1 🎵
        </div>

        {/* ボタン */}
        <button
          onClick={() => {
            // ✅ 広告再生シミュレーション
            alert("🎥 スペシャル広告を再生中...");
            setTimeout(() => {
              alert("🌈 広告完了！スペシャルボーナス問題へ進みます。");
              onClose();
            }, 1500);
          }}
          className="mt-3 px-6 py-3 rounded-xl font-bold text-white bg-yellow-500 hover:bg-yellow-600 shadow"
        >
          🎥 広告を見てスペシャル挑戦へ！
        </button>

        <button
          onClick={() => onClose()}
          className="mt-4 block mx-auto text-sm text-gray-600 hover:text-gray-800 underline"
        >
          今回はやめておく
        </button>
      </motion.div>
    </motion.div>
  );
}
