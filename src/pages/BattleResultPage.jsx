// ------------------------------------------------------
// 🌈 BattleResultPage.jsx（v3.6 修正版 / AdRewardModal対応・正解数分岐）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";
import { playFullScale } from "@/lib/useDoremiSound";
import RankUpModal from "@/components/ui/RankUpModal";
import AdRewardModal from "@/components/ui/AdRewardModal"; // ✅ 修正済み

export default function BattleResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const isWin = state?.isWin ?? false;
  const userScore = state?.userScore ?? 0;
  const cpuScore = state?.cpuScore ?? 0;

  const [dpInfo, setDpInfo] = useState(null);
  const [rainbow, setRainbow] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adType, setAdType] = useState(null);

  const uid = "demoUser"; // 後でAuth uidに置換

  // 🎯 DP加算＋RankUpチェック＋広告タイプ判定
  useEffect(() => {
    let gain = 0;
    let type = null;

    if (userScore <= 3) {
      gain = 0;
      type = null;
    } else if (userScore >= 4 && userScore <= 6) {
      gain = userScore === 4 ? 2 : userScore === 5 ? 5 : 7;
      type = "extend";
    } else if (userScore === 7) {
      gain = 10;
      type = "bonus";
    }

    setAdType(type);

    if (gain > 0) {
      updateDoremiPoints(uid, gain).then((info) => {
        setDpInfo(info);
        if (isWin || userScore === 7) {
          playFullScale();
          setTimeout(() => setRainbow(true), 600);
        }
        if (info?.prevRank !== info?.rank) setShowRankUp(true);
      });
    } else {
      setDpInfo({ points: 0, rank: "リコーダー", prevRank: "リコーダー" });
    }

    // 🎥 広告誘導モーダル（4問以上で表示）
    if (type) setTimeout(() => setShowAdModal(true), 2500);
  }, [userScore, isWin]);

  // 🎥 広告完了時の処理
  const handleAdComplete = async () => {
    if (adType === "extend") {
      alert("🌀 延長3問に挑戦できるようになったよ！");
      navigate("/battle/play?mode=extend");
    } else if (adType === "bonus") {
      await updateDoremiPoints(uid, 5);
      alert("🌟 ボーナス問題で +5 DP 獲得！");
    } else {
      alert("❤️ 再開しました！");
      navigate("/battle/play");
    }
    setShowAdModal(false);
  };

  const handleRetry = () => navigate("/battle/play");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-50 to-blue-100 overflow-hidden text-center transition-all duration-700">
      {/* 🌈 背景虹 */}
      {rainbow && (
        <motion.div
          className="absolute top-0 left-0 w-full h-[50vh] pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            background:
              "linear-gradient(120deg, rgba(255,0,0,0.5), rgba(255,165,0,0.5), rgba(255,255,0,0.5), rgba(0,255,0,0.5), rgba(0,191,255,0.5), rgba(0,0,255,0.5), rgba(148,0,211,0.5))",
            filter:
              "blur(25px) saturate(1.5) brightness(1.1) drop-shadow(0 0 20px rgba(255,255,255,0.3))",
            borderRadius: "50% / 25%",
            transform: "rotate(-8deg)",
          }}
        />
      )}

      {/* 🏆 タイトル */}
      <motion.h2
        className="text-3xl font-bold text-indigo-600 mb-4 z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {userScore >= 7
          ? "🌟 パーフェクト！"
          : userScore >= 4
          ? "🌀 よくがんばった！あと少し！"
          : "💪 次こそリズムを刻もう！"}
      </motion.h2>

      <p className="text-gray-700 mb-6 z-10">
        あなた {userScore} 問 vs CPU {cpuScore} 問
      </p>

      {/* 🎵 DP情報 */}
      {dpInfo ? (
        <motion.div
          className="bg-white rounded-2xl shadow-lg px-8 py-6 mb-6 z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <p className="text-lg mb-2">
            🎵 獲得ドレミポイント：
            <span className="font-bold">
              {userScore >= 4 ? `+${dpInfo?.points - (dpInfo?.prevPoints || 0)} DP` : "0 DP"}
            </span>
          </p>
          <p className="text-gray-600 mb-2">累計：{dpInfo.points} DP</p>
          <p className="text-pink-600 font-bold text-xl">
            鍵盤称号：{dpInfo.rank}
          </p>
          {dpInfo.prevRank !== dpInfo.rank && (
            <motion.div
              className="mt-3 text-yellow-500 font-bold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🌟 称号アップ！ {dpInfo.prevRank} → {dpInfo.rank} 🎹
            </motion.div>
          )}
        </motion.div>
      ) : (
        <p className="text-gray-400">DPを更新中...</p>
      )}

      {/* 🔁 ボタン */}
      <div className="flex flex-col gap-3 z-10">
        <button
          onClick={handleRetry}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition"
        >
          🔁 もう一度バトル！
        </button>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
        >
          🏠 ホームへ
        </button>
      </div>

      {/* 🎥 AdRewardModal */}
      <AdRewardModal
        open={showAdModal} // ✅ 修正ポイント①
        onClose={() => setShowAdModal(false)}
        onReward={handleAdComplete}
      />
    </div>
  );
}
