// ------------------------------------------------------
// 🌈 PremiumGachaResultModal.jsx（v2.0 Firestore登録対応）
// ------------------------------------------------------
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NoteBurst from "./NoteBurst";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function PremiumGachaResultModal({ open, onClose, card }) {
  useEffect(() => {
    if (open) {
      // 🌈 効果音再生
      const audio = new Audio("/sounds/effects/gacha_complete.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});

      // 🎯 Firestore登録処理
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;
      if (user && card) {
        const ref = doc(db, "userPremiumItems", user.uid);
        setDoc(
          ref,
          {
            [card.imageName || `premium_${Date.now()}`]: {
              name: card.name || "プレミアムアイテム",
              imageName: card.imageName || "noimage",
              seriesId: card.seriesId || "premium",
              acquiredAt: new Date().toISOString(),
            },
          },
          { merge: true }
        )
          .then(() => console.log("✅ プレミアムアイテム登録完了"))
          .catch((e) => console.error("🔥 Firestore登録エラー", e));
      }
    }
  }, [open, card]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-gradient-to-b from-indigo-900 via-violet-700 to-pink-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 🌈 NoteBurst演出 */}
          <NoteBurst
            mode="sequence"
            labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
            type="study"
            intervalMs={250}
            waveDelayMs={400}
            waveStepMs={80}
          />

          {/* 💫 タイトル */}
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] mt-4"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            🎉 プレミアムアイテムを入手しました！
          </motion.h1>

          {/* 🎴 カード演出 */}
          <motion.div
            className="relative mt-10 w-52 h-72 rounded-2xl border-4 border-yellow-300 shadow-[0_0_20px_rgba(255,215,0,0.6)] overflow-hidden bg-gradient-to-b from-yellow-100 to-white"
            initial={{ scale: 0.5, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <img
              src={
                card?.imagePath ||
                `/images/${card?.seriesId || "premium"}/stage1/${card?.imageName || "noimage"}.png`
              }
              alt={card?.name || "Premium Item"}
              className="absolute inset-0 w-full h-full object-contain p-4"
              draggable={false}
            />
            <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
              PREMIUM
            </div>
          </motion.div>

          {/* 🌟 下部テキスト */}
          <motion.p
            className="mt-6 text-white/90 font-semibold text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            図鑑に登録されました！
          </motion.p>

          {/* ✅ 閉じるボタン */}
          <motion.button
            onClick={onClose}
            className="mt-10 px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-full shadow-lg"
            whileTap={{ scale: 0.95 }}
          >
            ✅ OK
          </motion.button>

          {/* ✨ 背景光アニメ */}
          <style>{`
            @keyframes shineMove {
              0% { background-position: 0 0; opacity: 0.6; }
              50% { background-position: 120px 0; opacity: 0.9; }
              100% { background-position: 0 0; opacity: 0.6; }
            }
            .animate-bgshine {
              animation: shineMove 8s ease-in-out infinite;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
