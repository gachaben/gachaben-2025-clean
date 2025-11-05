// ------------------------------------------------------
// 🟩 AdExtendModal.jsx（4〜6問正解用 / 延長チャレンジ）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import NaviBubble from "@/components/NaviBubble";

export default function AdExtendModal({ correctCount, onClose }) {
  const dpBonus = correctCount === 4 ? 1 : correctCount === 5 ? 2 : 3;

  // ✅ Portal 用 root を body 直下に確保
  const portalRoot =
    document.getElementById("portal-root") ||
    (() => {
      const div = document.createElement("div");
      div.id = "portal-root";
      document.body.appendChild(div);
      return div;
    })();

// ✅ Portalで最前面にナビバブルを描画
const bubble = createPortal(
  <motion.div
    className="fixed bottom-[15%] left-[8%] z-[2147483647] pointer-events-none"
    initial={{ opacity: 0, x: -40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div
      style={{
        transform: "scale(1.1)",
        filter: "drop-shadow(0 0 12px rgba(255,255,255,0.9))",
      }}
    >
      <NaviBubble
        message={`おめでとう！${correctCount}問も正解だね！🎉`}
        subMessage={`すごい集中力だよ、その調子でボーナス問題に挑戦しよう！`}
      />
    </div>
  </motion.div>,
  portalRoot
);


  return (
    <>
      {bubble}

      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="relative bg-white rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full overflow-hidden z-[10000]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">ボーナス延長</h2>
          <p className="text-gray-600 mb-4">
            広告を視聴すると3問のボーナス問題に挑戦できます。
          </p>

          <p className="text-md font-semibold text-gray-600 mb-4">
            🎁 ボーナス報酬：<span className="text-pink-500">+{dpBonus} DP</span>
          </p>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => {
                alert("🎥 広告動画を再生中...");
                setTimeout(() => {
                  alert("✅ 広告完了！ボーナス問題へ進みます。");
                  onClose();
                }, 1500);
              }}
              className="px-6 py-3 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-lg"
            >
              🎥 広告を見て延長チャレンジ！
            </button>

            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              今回はやめておく
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
