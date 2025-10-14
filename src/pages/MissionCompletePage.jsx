// ------------------------------------------------------
// 🌈 MissionCompletePage.jsx（今日のミッション達成演出）
// ------------------------------------------------------
// - dailyMission.completed = true に更新
// - タイプに応じた報酬付与
// - 音符sequence演出＋光の波
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import NoteBurst from "../components/ui/NoteBurst";
import { useNavigate } from "react-router-dom";

export default function MissionCompletePage({ user }) {
  const navigate = useNavigate();
  const [missionType, setMissionType] = useState(null);
  const [reward, setReward] = useState("");
  const [wave, setWave] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const fetchMission = async () => {
      const ref = doc(db, "users", user.uid, "stats", "doremi");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const mission = data.dailyMission;
        if (!mission) return;

        if (mission.completed) {
          setAlreadyCompleted(true);
        } else {
          setMissionType(mission.type);
          giveReward(mission.type, ref, data);
        }
      }
    };
    fetchMission();
  }, [user]);

  const giveReward = async (type, ref, data) => {
    let rewardText = "";
    const updates = {};

    switch (type) {
      case "study":
        rewardText = "❤️ ハート全回復！";
        updates["hearts"] = 5; // 最大値に
        break;
      case "challenge":
        rewardText = "🎵 ドレミポイント +10！";
        updates["doremiPoints"] = (data.doremiPoints || 0) + 10;
        break;
      case "battle":
        rewardText = "🎟 バトル券 +1！";
        updates["battleTickets"] = (data.battleTickets || 0) + 1;
        break;
      default:
        rewardText = "🎁 報酬を受け取りました！";
    }

    setReward(rewardText);
    setWave(true);

    await updateDoc(ref, {
      ...updates,
      "dailyMission.completed": true,
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-gradient-to-b from-blue-200 via-sky-100 to-white">
      {/* 🌈 背景 */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-cover opacity-40 animate-light z-0" />

      {/* 🌟 NoteBurst演出 */}
      {wave && (
        <NoteBurst
          mode="sequence"
          labels={["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ", "ド"]}
          intervalMs={400}
          waveDelayMs={600}
          waveStepMs={100}
          type="study"
        />
      )}

      {/* 🌸 タイトル */}
      <motion.h1
        className="text-3xl font-bold text-pink-600 mb-4 z-10 drop-shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {alreadyCompleted
          ? "🌙 今日のミッションはすでに達成済み"
          : "🎉 ミッション達成！"}
      </motion.h1>

      {/* 🎁 報酬 */}
      {reward && !alreadyCompleted && (
        <motion.div
          className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl px-8 py-6 shadow-xl border border-white/50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xl font-bold text-gray-800 mb-2">{reward}</p>
          <p className="text-sm text-gray-600">
            {missionType === "study" && "がんばったね！学びの心が満たされた✨"}
            {missionType === "challenge" && "努力が音になって響いたね🎶"}
            {missionType === "battle" && "勇気の証を手に入れた🔥"}
          </p>
        </motion.div>
      )}

      {/* 🏠 ホームへ */}
      <motion.button
        onClick={() => navigate("/home")}
        className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-2xl shadow-lg hover:bg-blue-600 transition z-10"
        whileTap={{ scale: 0.95 }}
      >
        ホームへ戻る
      </motion.button>

      {/* 💫 背景アニメーション */}
      <style>{`
        @keyframes lightFlow {
          0% { background-position: 0 0; opacity: 0.3; }
          50% { background-position: 100px 0; opacity: 0.6; }
          100% { background-position: 0 0; opacity: 0.3; }
        }
        .animate-light { animation: lightFlow 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
