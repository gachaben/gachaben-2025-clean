// ------------------------------------------------------
// 🎥 AdRewardModal.jsx（v2.0 / ModalContainer統合＋光演出）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModalContainer from "@/components/modals/ModalContainer";
import { playFullScale } from "@/lib/useDoremiSound";

export default function AdRewardModal({ isOpen, isWin, onAdComplete, onClose }) {
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [adFinished, setAdFinished] = useState(false);

  useEffect(() => {
    if (isOpen) playFullScale(); // モーダル開時にドレミ音
  }, [isOpen]);

  if (!isOpen) return null;

  const title = isWin
    ? "🎉 勝利おめでとう！"
    : "💪 惜しかった！でもまだ終わりじゃない！";

  const message = isWin
    ? "広告を見ると、ドレミポイントが2倍になるよ！"
    : "広告を見ると、もう一度挑戦できるよ！";

  const handleAd = async () => {
    setIsPlayingAd(true);
    try {
      await onAdComplete();
      playFullScale(); // 広告完了時
      setAdFinished(true);
      setTimeout(() => {
        setIsPlayingAd(false);
        onClose();
      }, 1500);
    } catch (e) {
      console.error("広告再生エラー:", e);
      setIsPlayingAd(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalContainer type="reward">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">{title}</h2>
          <p className="text-gray-700 mb-6">{message}</p>

          {/* 🎥 広告ボタン */}
          <button
            onClick={handleAd}
            disabled={isPlayingAd}
            className={`${
              isPlayingAd ? "bg-gray-400 cursor-not-allowed" : "bg-pink-500 hover:bg-pink-600"
            } text-white py-2 px-6 rounded-xl font-bold shadow-md transition mb-3`}
          >
            {isPlayingAd ? "再生中..." : "🎥 広告を見る"}
          </button>

          {/* 🚪 キャンセルボタン */}
          <button
            onClick={onClose}
            disabled={isPlayingAd}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-xl transition"
          >
            やめておく
          </button>

          {/* ✨ 光エフェクト */}
          {adFinished && (
            <motion.div
              className="absolute inset-0 bg-white opacity-0"
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.8 }}
            />
          )}
        </ModalContainer>
      </motion.div>
    </AnimatePresence>
  );
}
