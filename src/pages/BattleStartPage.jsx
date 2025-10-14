// ------------------------------------------------------
// 🎮 BattleStartPage.jsx（replay対応＋リベンジ中ラベル表示）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import AdRewardModal from "../components/ui/AdRewardModal";
import { motion } from "framer-motion";

const BattleStartPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const replay = location.state?.replay || false; // ← リベンジ中かどうか

  const [battleTickets, setBattleTickets] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // --- Firestoreからチケット枚数取得 ---
  useEffect(() => {
    if (!user?.uid) return;
    const fetchTickets = async () => {
      const statsRef = doc(db, "users", user.uid, "stats", "doremi");
      const snap = await getDoc(statsRef);
      if (snap.exists()) {
        setBattleTickets(snap.data().battleTickets || 0);
      } else {
        setBattleTickets(0);
      }
    };
    fetchTickets();
  }, [user]);

  // --- バトル開始処理 ---
  const startBattle = async () => {
    if (!user?.uid) return;
    const statsRef = doc(db, "users", user.uid, "stats", "doremi");

    if (!replay) {
      // 通常バトル：チケット消費
      if (battleTickets > 0) {
        await updateDoc(statsRef, { battleTickets: battleTickets - 1 });
      } else {
        setShowAdModal(true);
        return;
      }
    }

    navigate("/battle/play", { state: { doubleReward: false } });
  };

  // --- 広告でチケット追加（チケットがない時） ---
  const handleAdComplete = async () => {
    if (!user?.uid) return;
    const statsRef = doc(db, "users", user.uid, "stats", "doremi");
    const newTickets = battleTickets + 1;
    await updateDoc(statsRef, { battleTickets: newTickets });
    setBattleTickets(newTickets);
    setShowAdModal(false);
    navigate("/battle/play", { state: { doubleReward: false } });
  };

  if (battleTickets === null) return <p>読み込み中...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-sky-100 to-white">
      <motion.h1
        className="text-3xl font-bold mb-6 text-blue-700 drop-shadow-md"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🎵 ドレミチャレンジバトル
      </motion.h1>

      {/* 🎟️ 現在のバトル券枚数 */}
      <div className="text-lg mb-4 text-gray-700">
        バトル券：{battleTickets} 枚
        {replay && (
          <span className="ml-2 text-green-600 font-bold animate-pulse">
            （リベンジ中🔥）
          </span>
        )}
      </div>

      {/* 🪄 説明文 */}
      <p className="text-sm text-gray-600 mb-6 max-w-xs">
        {replay
          ? "今は広告のごほうびでリベンジチャンス！このバトルはチケットを消費しません。"
          : "バトル券が1枚消費されます。チケットがない場合は動画を見て参加できます。"}
      </p>

      {/* 🎮 スタートボタン */}
      <motion.button
        onClick={startBattle}
        className={`px-8 py-3 rounded-2xl text-white shadow-lg hover:scale-105 transition ${
          replay ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {replay ? "🔥 無料でリベンジ開始！" : "🎵 バトル開始！"}
      </motion.button>

      {/* 🎥 チケットがない時の広告導線 */}
      {showAdModal && (
        <AdRewardModal
          onClose={() => setShowAdModal(false)}
          onReward={handleAdComplete}
          rewardText="🎟️ バトル券 +1"
        />
      )}
    </div>
  );
};

export default BattleStartPage;
