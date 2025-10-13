// ------------------------------------------------------
// 🎵 BattleResultPage.jsx（DP最終ルール版：勝10/負5・復活は加点なし）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { updateDoremiPoints } from "@/utils/updateDoremiPoints";
import { grantTickets } from "@/utils/useTickets";
import RankUpModal from "@/components/ui/RankUpModal";
import NoteBurst from "@/components/ui/NoteBurst";

export default function BattleResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [modal, setModal] = useState({ show: false, old: "", new: "" });
  const [result, setResult] = useState("lose");
  const [dpGain, setDpGain] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  // 🎯 URLクエリから勝敗を判定
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const res = params.get("result") || "lose";
    setResult(res);
  }, [location.search]);

  // 🧮 DP加算＋参加賞処理（復活は加点なし）
  useEffect(() => {
    const handleResult = async () => {
      if (!user) return;
      const baseDp = result === "win" ? 10 : 5;

      // 🎵 DP 更新（勝10 / 負5）
      const updated = await updateDoremiPoints(user.uid, baseDp);
      setDpGain(baseDp);
      console.log(`✅ DP付与（最終ルール）：${baseDp}`);

      // 🏅 ランクアップ判定
      if (updated && updated.rank !== updated.prevRank) {
        setModal({ show: true, old: updated.prevRank, new: updated.rank });
      }

      // 🎫 参加賞：バトル券×5
      await grantTickets(user.uid, 5);
      console.log("🎁 参加賞: バトル券×5 配布");

      // 🌈 エフェクト
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 2500);
    };

    handleResult();
  }, [user, result]);

  // 🧭 ボタン処理
  const handleRetry = () => navigate("/battle/start");
  const handleHome = () => navigate("/");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-indigo-50 text-center relative">
      <h1 className="text-4xl font-bold mb-6">
        {result === "win" ? "🎉 勝利！" : "💡 よくがんばった！"}
      </h1>

      <p className="text-xl mb-4 text-gray-600">
        {result === "win"
          ? `+${dpGain} ドレミポイント獲得！`
          : `参加評価として +${dpGain} DP`}
      </p>

      <p className="text-md text-gray-500 mb-8">🎫 参加賞：バトル券 ×5</p>

      {showBurst && (
        <div className="fixed inset-0 z-[9990] pointer-events-none">
          <NoteBurst count={10} color="#a78bfa" />
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleRetry}
          className="px-6 py-3 rounded-full bg-indigo-500 text-white text-lg shadow-md hover:bg-indigo-600 transition"
        >
          もう一回バトル
        </button>
        <button
          onClick={handleHome}
          className="px-6 py-3 rounded-full bg-gray-300 text-gray-700 text-lg shadow-md hover:bg-gray-400 transition"
        >
          ホームにもどる
        </button>
      </div>

      {/* 🎹 ランクアップ表示 */}
      <RankUpModal
        show={modal.show}
        oldRank={modal.old}
        newRank={modal.new}
        onClose={() => setModal({ show: false, old: "", new: "" })}
      />
    </div>
  );
}
