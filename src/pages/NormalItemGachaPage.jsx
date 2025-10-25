// ------------------------------------------------------
// 🎰 NormalItemGachaPage.jsx（学習クリア報酬ガチャ）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit/app";
import { getAuth } from "firebase/auth";
import NoteBurst from "@/components/ui/NoteBurst";
import { useNavigate } from "react-router-dom";

// ✅ S/A/Bランク確率
const RANK_PROB = {
  S: 0.1,
  A: 0.3,
  B: 0.6,
};

// ✅ ランク別カラー
const RANK_COLOR = {
  S: "#ffd700",
  A: "#4ade80",
  B: "#60a5fa",
};

// ✅ アイテムシリーズ例
const SAMPLE_ITEMS = [
  { id: "001", name: "ミンミンゼミ", rank: "B" },
  { id: "002", name: "アゲハチョウ", rank: "A" },
  { id: "003", name: "オオクワガタ", rank: "S" },
  { id: "004", name: "カブトムシ", rank: "A" },
  { id: "005", name: "モンシロチョウ", rank: "B" },
  { id: "006", name: "タマムシ", rank: "S" },
];

export default function NormalItemGachaPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [sound] = useState(() => new Audio("/sounds/effects/gacha_complete.mp3"));

  // ✅ 抽選関数
  const drawItem = () => {
    const rand = Math.random();
    let rank = "B";
    if (rand < RANK_PROB.S) rank = "S";
    else if (rand < RANK_PROB.S + RANK_PROB.A) rank = "A";
    const candidates = SAMPLE_ITEMS.filter((i) => i.rank === rank);
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  // ✅ ガチャ開始
  const startGacha = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sound.play().catch(() => {});

    setTimeout(async () => {
      const item = drawItem();
      setResult(item);
      setIsSpinning(false);

      // Firestoreへ保存
      if (user) {
        const ref = doc(db, "users", user.uid, "inventory", item.id);
        await setDoc(ref, { ...item, obtainedAt: new Date().toISOString() }, { merge: true });
        console.log("🎁 獲得アイテム保存:", item);
      }
    }, 2500);
  };

  // ✅ ページ初期演出
  useEffect(() => {
    const introSound = new Audio("/sounds/effects/clear_study.mp3");
    introSound.play().catch(() => {});
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-blue-100 via-sky-100 to-white overflow-hidden">
      {/* 🌈 背景アニメ */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-cover opacity-40 animate-light" />

      {/* 🎵 音符エフェクト */}
      <NoteBurst mode="burst" quiet />

      {/* 🎰 タイトル */}
      <motion.h1
        className="text-3xl font-bold text-sky-600 drop-shadow-md mb-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎰 ノーマルアイテムガチャ！
      </motion.h1>

      {/* 🎁 ガチャ筐体 */}
      <div className="relative z-10 w-72 h-72 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/50 shadow-xl backdrop-blur-md">
        <AnimatePresence>
          {isSpinning ? (
            <motion.div
              key="spin"
              className="text-6xl animate-spin-slow"
              style={{ color: "#f59e0b" }}
            >
              🎵
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              className="text-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              <p
                className="text-2xl font-bold mb-2"
                style={{ color: RANK_COLOR[result.rank] }}
              >
                {result.name}
              </p>
              <p className="text-lg text-gray-600">ランク：{result.rank}</p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic"
            >
              ガチャを回して報酬をゲット！
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎬 ボタン */}
      {!result && !isSpinning && (
        <motion.button
          onClick={startGacha}
          className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-2xl shadow-lg hover:scale-105 transition"
          whileTap={{ scale: 0.95 }}
        >
          🎬 ガチャを回す！
        </motion.button>
      )}

      {result && (
        <motion.button
          onClick={() => navigate("/home")}
          className="mt-8 px-8 py-3 bg-green-500 text-white rounded-2xl shadow-lg hover:bg-green-600 transition"
          whileTap={{ scale: 0.95 }}
        >
          ✅ ホームに戻る
        </motion.button>
      )}

      <style>{`
        @keyframes lightMove {
          0% { background-position: 0 0; opacity: 0.3; }
          50% { background-position: 100px 0; opacity: 0.6; }
          100% { background-position: 0 0; opacity: 0.3; }
        }
        .animate-light { animation: lightMove 10s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 1.2s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
