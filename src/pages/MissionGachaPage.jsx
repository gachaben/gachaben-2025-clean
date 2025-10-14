// ------------------------------------------------------
// 🎰 MissionGachaPage.jsx（ミッションガチャ）
// ------------------------------------------------------
import React, { useState, useEffect } from "react"; // ←これを一番上！
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import AdRewardModal from "../components/ui/AdRewardModal";
import NoteBurst from "../components/ui/NoteBurst";
import { useNavigate } from "react-router-dom";

const MISSION_TYPES = [
  { id: "study", label: "📘 学習チャレンジ", color: "#60a5fa" },
  { id: "challenge", label: "⚡ チャレンジ問題", color: "#facc15" },
  { id: "battle", label: "🥊 バトルチャレンジ", color: "#f87171" },
];

export default function MissionGachaPage({ user }) {
  const navigate = useNavigate();
  const [showAdModal, setShowAdModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [alreadyAssigned, setAlreadyAssigned] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // --- Firestore確認 ---
  useEffect(() => {
    if (!user?.uid) return;
    const fetchMission = async () => {
      const ref = doc(db, "users", user.uid, "stats", "doremi");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.dailyMission?.assignedDate === today) {
          setSelectedMission(data.dailyMission.type);
          setAlreadyAssigned(true);
        }
      }
    };
    fetchMission();
  }, [user, today]);

  // ✅ 正しい位置に移動（ここが安全）
  useEffect(() => {
    console.log("✅ MissionGachaPage mounted", user?.uid);
  }, [user]);

  // --- 広告視聴完了時 ---
  const handleAdReward = () => {
    console.log("🎬 広告報酬完了 → ガチャ開始");
    setShowAdModal(false);
    setTimeout(() => {
      startMissionGacha();
    }, 800);
  };

  // --- ミッションガチャ処理 ---
  const startMissionGacha = async () => {
    console.log("🎯 startMissionGacha called", { uid: user?.uid });
    if (!user?.uid || spinning) return;
    setSpinning(true);

    const weights = [0.4, 0.35, 0.25];
    const rand = Math.random();
    let result;
    if (rand < weights[0]) result = "study";
    else if (rand < weights[0] + weights[1]) result = "challenge";
    else result = "battle";

    setTimeout(async () => {
      setSelectedMission(result);
      setSpinning(false);

      try {
        const ref = doc(db, "users", user.uid, "stats", "doremi");
        await setDoc(
          ref,
          {
            dailyMission: {
              type: result,
              assignedDate: today,
              completed: false,
            },
          },
          { merge: true }
        );
        console.log("✅ Firestore 保存完了", result);
      } catch (err) {
        console.error("🔥 Firestore 保存エラー", err);
      }
    }, 3000);
  };

  // --- UI ---
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden text-center bg-gradient-to-b from-blue-100 via-sky-100 to-white">
      {/* 🌈 背景 */}
      <div className="absolute inset-0 bg-[url('/images/light-rays.png')] bg-cover opacity-40 animate-light z-0" />
      <NoteBurst mode="burst" quiet />

      {/* 🎵 タイトル */}
      <motion.h1
        className="text-3xl font-bold text-blue-600 mb-4 z-10 drop-shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🎰 今日のミッションガチャ！
      </motion.h1>

      {/* 🎁 ガチャエリア */}
      <div className="relative z-10 w-72 h-72 flex items-center justify-center rounded-full border-8 border-white/50 bg-white/40 shadow-xl backdrop-blur-md">
        <AnimatePresence>
          {spinning ? (
            <motion.div
              key="spinning"
              className="text-6xl font-bold animate-spin-slow"
              style={{ color: "#facc15" }}
            >
              🎵
            </motion.div>
          ) : selectedMission ? (
            <motion.div
              key="result"
              className="text-2xl font-bold text-gray-800"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
            >
              {MISSION_TYPES.find((m) => m.id === selectedMission)?.label}
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              className="text-lg text-gray-500 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🎥 広告を見てガチャを回そう！
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎥 ガチャボタン */}
      {!alreadyAssigned && !spinning && !selectedMission && (
        <motion.button
          onClick={() => setShowAdModal(true)}
          className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-2xl shadow-lg hover:scale-105 transition z-10"
          whileTap={{ scale: 0.95 }}
        >
          🎥 広告を見てガチャを回す！
        </motion.button>
      )}

      {/* ✅ 結果ボタン */}
      {selectedMission && !spinning && (
        <motion.button
          onClick={() => navigate("/home")}
          className="mt-8 px-8 py-3 bg-green-500 text-white rounded-2xl shadow-lg hover:bg-green-600 transition"
          whileTap={{ scale: 0.95 }}
        >
          ✅ ホームに進む
        </motion.button>
      )}

      {/* 🎥 広告モーダル */}
      {showAdModal && (
        <AdRewardModal
          open={showAdModal}
          onClose={() => setShowAdModal(false)}
          onReward={handleAdReward}
          rewardText="🎁 ミッションガチャが回せるようになった！"
        />
      )}

      {/* 💫 背景アニメーション */}
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
