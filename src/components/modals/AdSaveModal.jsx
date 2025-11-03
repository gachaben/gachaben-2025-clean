// ------------------------------------------------------
// 🎥 AdSaveModal.jsx（v2.0 / ModalContainer統合＋希望トーン）
// ------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ModalContainer from "@/components/modals/ModalContainer";
import { playNote } from "@/lib/useDoremiSound";

export default function AdSaveModal({ show, onClose, wrongs = [] }) {
  const navigate = useNavigate();
  if (!show) return null;

  const handleWatchAd = async () => {
  try {
    playNote("mi");
    await new Promise((r) => setTimeout(r, 2000));
    playNote("so");
    onClose(); // ✅ モーダルを閉じる
    navigate("/challenge/retry", { state: { wrongs, resumeStreak: true } });
  } catch (err) {
    console.error("[AdSaveModal] Error:", err);
    onClose();
  }
};


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[2000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalContainer type="save">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            💪 きみなら できる！
          </h2>

          <p className="text-gray-700 mb-6 leading-relaxed">
            連続正解の記録がストップしちゃった…！<br />
            でも、止まったっていい。<br />
            また動き出せば、それでいい。<br />
            広告を見て、もう一度チャレンジしよう！
          </p>

          <div className="flex flex-col gap-3">
            <button
              className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-pink-600 transition"
              onClick={handleWatchAd}
            >
              🎥 あきらめない！（広告を見て再チャレンジ）
            </button>
            <button
              className="text-gray-500 underline mt-2"
              onClick={onClose}
            >
              あきらめる…
            </button>
          </div>
        </ModalContainer>
      </motion.div>
    </AnimatePresence>
  );
}
