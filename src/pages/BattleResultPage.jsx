// src/pages/BattleResultPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { grantBattleRewards } from "@/lib/grantBattleRewards";

export default function BattleResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const battleId = state?.battleId;

  const [battle, setBattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!battleId) {
      setError("battleId がありません");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "battles", battleId));
        if (snap.exists()) setBattle(snap.data());
        else setError("対戦結果が見つかりません");
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [battleId]);

  const winnerLabel = useMemo(() => {
    if (!battle) return "";
    return battle.winner === "you" ? "勝利！" : (battle.winner === "enemy" ? "敗北…" : "引き分け");
  }, [battle]);

  const handleClaim = async () => {
    if (!battleId) return;
    setClaiming(true);
    setError("");
    try {
      const res = await grantBattleRewards(battleId);
      setClaimResult(res);
      // 反映のため再読込
      const snap = await getDoc(doc(db, "battles", battleId));
      if (snap.exists()) setBattle(snap.data());
    } catch (e) {
      setError(String(e));
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="p-6">読み込み中…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!battle) return <div className="p-6">結果がありません</div>;

  const already = !!battle.rewardsClaimed;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">バトル結果</h1>
      <div className="rounded-2xl p-4 shadow bg-white">
        <div className="text-lg font-semibold">{winnerLabel}</div>
        <div className="mt-2 text-sm">
          問題数: {battle.questionCount ?? battle.roundsPlayed ?? "-"}
        </div>
        <div className="mt-1 text-sm">
          自分PW: {battle.myPwStart} → {battle.myPwEnd}
        </div>
        <div className="mt-1 text-sm">
          相手PW: {battle.enemyPwStart} → {battle.enemyPwEnd}
        </div>
        {typeof battle._bptEarned === "number" && (
          <div className="mt-2 text-sm">付与記録: +{battle._bptEarned} Bpt</div>
        )}
        {battle.rewardsClaimed && (
          <div className="mt-1 text-xs text-gray-500">受取済み</div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={handleClaim}
          disabled={claiming || already}
        >
          {already ? "受取済み" : (claiming ? "付与中…" : "Bpt を受け取る")}
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-gray-200"
          onClick={() => navigate("/")}
        >
          ホームに戻る
        </button>
      </div>

      {claimResult && !claimResult.alreadyClaimed && (
        <div className="text-green-700 text-sm">
          +{claimResult.bptEarned} Bpt を付与しました
        </div>
      )}
      {claimResult?.alreadyClaimed && (
        <div className="text-gray-600 text-sm">既に受取済みです</div>
      )}
    </div>
  );
}
