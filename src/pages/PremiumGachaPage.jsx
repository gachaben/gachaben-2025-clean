// ------------------------------------------------------
// 🌈 PremiumGachaPage.jsx（プレミアムガチャ / 7回確定当たり）
// ------------------------------------------------------
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit/app";
import { getAuth } from "firebase/auth";
import NoteBurst from "@/components/ui/NoteBurst";
import { useNavigate } from "react-router-dom";

const PREMIUM_ITEMS = [
  { id: "P001", name: "虹のグランドマイスター", rarity: "LEGEND", color: "#ff9ff3" },
  { id: "P002", name: "オーロラハーモニー", rarity: "ULTRA", color: "#60a5fa" },
  { id: "P003", name: "光のシンフォニア", rarity: "ULTRA", color: "#facc15" },
  { id: "P004", name: "天空ピアニスト", rarity: "SUPER", color: "#34d399" },
  { id: "P005", name: "ドレミフェニックス", rarity: "LEGEND", color: "#f87171" },
];

export default function PremiumGachaPage() {
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [count, setCount] = useState(0); // 外れカウント
  const [sound] = useState(() => new Audio("/sounds/effects/gacha_complete.mp3"));
  const [rainbowSound] = useState(() => new Audio("/sounds/effects/battle_complete.mp3"));

  // ✅ プレミアム抽選
  const drawPremium = () => {
    const item = PREMIUM_ITEMS[Math.floor(Math.random() * PREMIUM_ITEMS.length)];
    return item;
  };

  // ✅ ガチャ開始
  const startGacha = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    sound.play().catch(() => {});

    setTimeout(async () => {
      let item = null;
      let newCount = count + 1;

      // 🌈 7回目は確定当たり！
      if (newCount >= 7) {
        item = drawPremium();
        rainbowSound.play().catch(() => {});
        setCount(0); // reset
      } else {
        // ハズレ演出（今回は表示だけ）
        item = { id: "NONE", name: "はずれ…", rarity: "NONE", color: "#999" };
      }

      setResult(item);
      setIsSpinning(false);

      // Firestore 保存
      if (user && item.id !== "NONE") {
        const ref = doc(db, "users", user.uid, "inventory", item.id);
        await setDoc(ref, { ...item, obtainedAt: new Date().toISOString() }, { merge: true });
        console.log("🌈 プレミアムアイテム保存:", item);
      }

      // Firestoreにカウント保存（外れ連続数）
      if (user) {
        const statRef = doc(db, "users", user.uid, "stats", "premiumGacha");
        await setDoc(statRef, { missCount: item.id === "NONE" ? newCount : 0 }, { merge: true });
      }

      setCount(item.id === "NONE" ? newCount : 0);
    }, 2500);
  };

  // ✅ 開始音・演出
  useEffect(() => {
    const introSound = new Audio("/sounds/effects/opening_theme.mp3");
    introSound.play().catch(() => {});
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-pink-100 via-rose-100 to-white overflow-hidden">
      {/* 🌈 背景 */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-cover opacity-40 animate-light" />

      {/* 🎵 虹演出（7回確定で発火） */}
      {result?.id !== "NONE" && (
        <NoteBurst mode="sequence" type="study" labels={["ド","レ","ミ","ファ","ソ","ラ","シ","ド"]} />
      )}

      {/* 🎰 タイトル */}
      <motion.h1
        className="text-3xl font-bold text-pink-600 drop-shadow-md mb-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🌈 プレミアムガチャ！
      </motion.h1>

      {/* 🎁 ガチャ筐体 */}
      <div className="relative z-10 w-72 h-72 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/60 shadow-xl backdrop-blur-md">
        <AnimatePresence>
          {isSpinning ? (
            <motion.div
              key="spin"
              className="text-6xl animate-spin-slow"
              style={{ color: "#ec4899" }}
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
                style={{ color: result.color }}
              >
                {result.name}
              </p>
              <p className="text-lg text-gray-600">
                {result.id === "NONE" ? "また挑戦しよう！" : `レア度：${result.rarity}`}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500 italic"
            >
              🎥 広告を見てガチャを回そう！
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

      {/* 背景アニメ */}
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
