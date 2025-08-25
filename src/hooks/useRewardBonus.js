import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useRewardBonus } from "../hooks/useRewardBonus";
import { ensureUserIncrement } from "../lib/ensureUserIncr";

/**
 * 蜑肴署・・
 * - navigate("/battle/result", { state: { battleId, userId, baseBpt }})
 *   縺ｿ縺溘＞縺ｫ蜿励￠蜿悶▲縺ｦ縺・ｋ諠ｳ螳壹・
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

  // 蛻晄悄縺ｫ battles/{id}.bonus.granted 繧定ｦ九※縲√・繧ｿ繝ｳ縺ｮ譛牙柑/辟｡蜉ｹ繧呈ｱｺ繧√ｋ
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
      type: "extra_reward", // 竊・縺薙％繧・"extra_gacha" 縺ｫ縺吶ｌ縺ｰ繧ｬ繝√Ε繧ゅ≧1蝗槭↓繧ゅ〒縺阪ｋ
      onGrant: async () => {
        // 霑ｽ蜉Bpt・亥渕譛ｬ縺ｨ蜷碁㍼・峨ｒ莉倅ｸ・
        await ensureUserIncrement(userId, "bpt", baseBpt);
      },
    });
    setBusy(false);
    if (ok) setBonusUsed(true);
  };

  if (!battleId || !userId) {
    return <div className="p-4 text-red-600">邨先棡諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺吶・/div>;
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">繝舌ヨ繝ｫ邨先棡</h2>
      <p>蝓ｺ譛ｬ蝣ｱ驟ｬ・咤pt {baseBpt}</p>

      <button
        onClick={handleBonusClick}
        disabled={loading || busy || bonusUsed}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {bonusUsed
          ? "繝懊・繝翫せ迯ｲ蠕玲ｸ医∩"
          : loading
          ? "隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ..."
          : "蠎・相繧定ｦ九※・・蝗槫ｱ驟ｬ・・}
      </button>

      {/* 繧ｬ繝√Ε縺ｫ謖ｯ繧九ヱ繧ｿ繝ｼ繝ｳ萓・
      <button
        onClick={() => runBonus({ col: "battles", id: battleId, type: "extra_gacha", onGrant: doGachaOnce })}
        className="px-4 py-2 rounded bg-green-600 text-white"
      >
        蠎・相縺ｧ繧ｬ繝√Ε繧ゅ≧1蝗橸ｼ・
      </button>
      */}
    </div>
  );
}
