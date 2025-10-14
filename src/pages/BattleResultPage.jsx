// ------------------------------------------------------
// 🌙→🌅 BattleResultPage.jsx（勝利2倍広告＋敗北リベンジ広告）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import NoteBurst from "../components/ui/NoteBurst";
import AdRewardModal from "../components/ui/AdRewardModal";
import { motion } from "framer-motion";

const BattleResultPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isWin, doubleReward = false } = location.state || {};

  const [points, setPoints] = useState(0);
  const [rewardGiven, setRewardGiven] = useState(false);
  const [showSequence, setShowSequence] = useState(false);
  const [fadeToMorning, setFadeToMorning] = useState(false);

  // 🎥 広告モーダル
  const [showDoubleAd, setShowDoubleAd] = useState(false);
  const [showRevengeAd, setShowRevengeAd] = useState(false);

  // --- 報酬計算 ---
  useEffect(() => {
    let base = isWin ? 10 : 5;
    if (doubleReward) base *= 2;
    setPoints(base);
  }, [isWin, doubleReward]);

  // --- Firestore加算＋演出 ---
  useEffect(() => {
    const addPoints = async () => {
      if (!user?.uid || rewardGiven) return;
      const statsRef = doc(db, "users", user.uid, "stats", "doremi");
      const snap = await getDoc(statsRef);
      const current = snap.exists() ? snap.data().doremiPoints || 0 : 0;
      await updateDoc(statsRef, { doremiPoints: current + points });
      setRewardGiven(true);

      // 🌠 勝利時 → 音符sequence
      if (isWin) {
        setTimeout(() => setShowSequence(true), 1000);
      } else {
        // 💫 敗北時 → 放置で朝フェード
        setTimeout(() => setFadeToMorning(true), 8000);
      }
    };
    if (points > 0) addPoints();
  }, [user, points, rewardGiven, isWin]);

  // --- 2倍広告完了 ---
  const handleDoubleReward = async () => {
    if (!user?.uid) return;
    const statsRef = doc(db, "users", user.uid, "stats", "doremi");
    const snap = await getDoc(statsRef);
    const current = snap.exists() ? snap.data().doremiPoints || 0 : 0;
    await updateDoc(statsRef, { doremiPoints: current + points }); // ←再加算
    setShowDoubleAd(false);
    navigate("/home");
  };

  // --- リベンジ広告完了 ---
  const handleRevenge = () => {
    setShowRevengeAd(false);
    navigate("/battle/start", { state: { replay: true } });
  };

  // --- 朝フェード後リセット ---
  useEffect(() => {
    if (fadeToMorning) {
      const timer = setTimeout(() => navigate("/login"), 4000);
      return () => clearTimeout(timer);
    }
  }, [fadeToMorning, navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center text-white">
      {/* 🌌 星空背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-slate-900 to-black z-0" />
      <div className="absolute inset-0 bg-[url('/images/stars_layer.png')] bg-cover opacity-70 animate-stars z-0" />

      {/* 🌙 月光 */}
      <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-30 z-0" />

      {/* 🌠 音符sequence */}
      {showSequence && (
        <NoteBurst
          mode="sequence"
          labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
          intervalMs={400}
          waveDelayMs={600}
          waveStepMs={100}
          type="study"
        />
      )}

      {/* 🌟 タイトル */}
      <motion.h1
        className="text-3xl font-bold z-10 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {isWin ? "🎉 勝利おめでとう！" : "💫 また挑戦しよう！"}
      </motion.h1>

      {/* 🎵 報酬カード */}
      <motion.div
        className="relative z-10 mt-6 bg-white/10 backdrop-blur-md px-8 py-6 rounded-3xl border border-white/20 shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-lg mb-2">今回の報酬</p>
        <p className="text-4xl font-bold text-yellow-300 mb-2">
          +{points} Doremiポイント
        </p>
        {doubleReward && (
          <p className="text-sm text-pink-300 animate-pulse">
            🎥 ポイント2倍ボーナス！
          </p>
        )}
      </motion.div>

      {/* 🎥 勝利：2倍広告 */}
      {isWin && (
        <motion.button
          onClick={() => setShowDoubleAd(true)}
          className="mt-8 px-6 py-3 bg-pink-500 text-white rounded-2xl shadow-lg hover:scale-105 transition z-10"
          whileTap={{ scale: 0.95 }}
        >
          🎥 広告を見てポイント2倍！
        </motion.button>
      )}

      {/* 🎥 敗北：リベンジ広告 */}
      {!isWin && (
        <motion.button
          onClick={() => setShowRevengeAd(true)}
          className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:scale-105 transition z-10"
          whileTap={{ scale: 0.95 }}
        >
          🎥 広告を見てリベンジ！
        </motion.button>
      )}

      {/* 🏠 ホームへ */}
      <motion.button
        onClick={() => navigate("/home")}
        className="relative z-10 mt-4 px-6 py-2 bg-blue-500/80 text-white rounded-xl shadow-md hover:bg-blue-600 transition"
        whileTap={{ scale: 0.95 }}
      >
        ホームへ戻る
      </motion.button>

      {/* 🎥 各広告モーダル */}
      {showDoubleAd && (
        <AdRewardModal
          onClose={() => setShowDoubleAd(false)}
          onReward={handleDoubleReward}
          rewardText="🎁 ポイント2倍ボーナス獲得！"
        />
      )}
      {showRevengeAd && (
        <AdRewardModal
          onClose={() => setShowRevengeAd(false)}
          onReward={handleRevenge}
          rewardText="🎟️ リベンジチケット獲得！"
        />
      )}

      {/* 🌅 朝フェード */}
      {fadeToMorning && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-orange-100 via-sky-100 to-white z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          <motion.p
            className="text-2xl font-bold text-gray-700 drop-shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            🌅 新しい朝が始まります…
          </motion.p>
        </motion.div>
      )}

      {/* ✨ 星アニメーション */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes driftStars {
          0% { background-position: 0 0; }
          100% { background-position: -2000px 1000px; }
        }
        .animate-stars {
          animation: driftStars 120s linear infinite, twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default BattleResultPage;
