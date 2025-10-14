// ------------------------------------------------------
// 🏠 HomePage.jsx（今日のミッション進捗反映版）
// ------------------------------------------------------
// - Firestoreから dailyMission を取得
// - 未達成なら「挑戦する！」ボタン
// - 達成済みなら「🌈達成済み！」表示
// - 1日1ミッション制
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import NoteBurst from "../components/ui/NoteBurst";

export default function HomePage({ user }) {
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchMission = async () => {
      const ref = doc(db, "users", user.uid, "stats", "doremi");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const today = new Date().toISOString().split("T")[0];
        if (
          data.dailyMission &&
          data.dailyMission.assignedDate === today
        ) {
          setMission(data.dailyMission);
          setIsCompleted(!!data.dailyMission.completed);
        }
      }
    };
    fetchMission();
  }, [user]);

  const missionLabel = {
    study: "📘 学習チャレンジ",
    challenge: "⚡ チャレンジ問題",
    battle: "🥊 バトルチャレンジ",
  };

  const missionColor = {
    study: "bg-blue-100 border-blue-300",
    challenge: "bg-yellow-100 border-yellow-300",
    battle: "bg-red-100 border-red-300",
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-gradient-to-b from-sky-100 via-blue-50 to-white">
      {/* 🌤️ 背景演出 */}
      <NoteBurst mode="burst" quiet />
      <div className="absolute inset-0 bg-[url('/images/clouds.png')] bg-bottom bg-repeat-x opacity-50 animate-clouds" />

      {/* 🏠 タイトル */}
      <motion.h1
        className="text-3xl font-bold text-pink-600 mb-6 drop-shadow-md z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎵 ドレスタ ホーム
      </motion.h1>

      {/* 🌈 ミッションボックス */}
      {mission ? (
        <motion.div
          className={`relative z-10 border-2 rounded-3xl shadow-lg px-6 py-4 w-80 ${missionColor[mission.type]}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xl font-bold mb-2">
            {missionLabel[mission.type]}
          </p>

          {isCompleted ? (
            <>
              <p className="text-green-600 font-semibold mb-3">
                🌈 今日のミッションは達成済み！
              </p>
              <motion.button
                onClick={() => navigate("/mission/complete")}
                className="px-6 py-2 bg-green-500 text-white rounded-full shadow hover:bg-green-600 transition"
                whileTap={{ scale: 0.95 }}
              >
                🌟 達成演出を見る
              </motion.button>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-3">今日の挑戦が待っています。</p>
              <motion.button
                onClick={() => {
                  if (mission.type === "study") navigate("/study");
                  else if (mission.type === "challenge") navigate("/challenge");
                  else if (mission.type === "battle") navigate("/battle/start");
                }}
                className="px-6 py-2 bg-pink-500 text-white rounded-full shadow hover:bg-pink-600 transition"
                whileTap={{ scale: 0.95 }}
              >
                🚀 挑戦する！
              </motion.button>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="relative z-10 bg-white/70 backdrop-blur-md px-6 py-5 rounded-2xl border shadow-lg text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          🎰 まだ今日のミッションが決まっていません！
          <br />
          <motion.button
            onClick={() => navigate("/mission/gacha")}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
            whileTap={{ scale: 0.95 }}
          >
            🎥 ミッションガチャを回す！
          </motion.button>
        </motion.div>
      )}

      {/* ☁️ アニメーション */}
      <style>{`
        @keyframes moveClouds {
          0% { background-position: 0 bottom; }
          100% { background-position: 1000px bottom; }
        }
        .animate-clouds { animation: moveClouds 60s linear infinite; }
      `}</style>
    </div>
  );
}
