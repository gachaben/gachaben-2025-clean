import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useRewardBonus } from "../hooks/useRewardBonus";
import { ensureUserIncrement } from "../lib/ensureUserIncr";

/**
 * 前提：
 * - navigate("/battle/result", { state: { battleId, userId, baseBpt }})
 *   みたいに受け取っている想定。
 */
export default function BattleResultPage() {
  const { state } = useLocation();
  const battleId = state?.battleId;
  const userId = state?.userId;
  const baseBpt = state?.baseBpt ?? 10;

  const [bonusUsed, setBonusUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const { runBonus } = useRewardBonus();

  // 初期に battles/{id}.bonus.granted を見て、ボタンの有効/無効を決める
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!battleId) return;
      const snap = await getDoc(doc(db, "battles", battleId));
      const bonus = snap.data()?.bonus;
      if (mounted) {
        setBonusUsed(!!bonus?.granted);
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [battleId]);

  const handleBonusClick = async () => {
    if (busy || bonusUsed || !battleId || !userId) return;
    setBusy(true);
    const ok = await runBonus({
      col: "battles",
      id: battleId,
      type: "extra_reward", // ← ここを "extra_gacha" にすればガチャもう1回にもできる
      onGrant: async () => {
        // 追加Bpt（基本と同量）を付与
        await ensureUserIncrement(userId, "bpt", baseBpt);
      },
    });
    setBusy(false);
    if (ok) setBonusUsed(true);
  };

  if (!battleId || !userId) {
    return <div className="p-4 text-red-600">結果情報が不足しています。</div>;
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">バトル結果</h2>
      <p>基本報酬：Bpt {baseBpt}</p>

      <button
        onClick={handleBonusClick}
        disabled={loading || busy || bonusUsed}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {bonusUsed
          ? "ボーナス獲得済み"
          : loading
          ? "読み込み中..."
          : "広告を見て＋1回報酬！"}
      </button>

      {/* ガチャに振るパターン例
      <button
        onClick={() => runBonus({ col: "battles", id: battleId, type: "extra_gacha", onGrant: doGachaOnce })}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        広告でガチャもう1回！
      </button>
      */}
    </div>
  );
}
