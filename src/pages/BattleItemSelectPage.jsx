import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LS_BATTLE_KEY = "currentBattleId";

// 仮データ（あとでFirestore接続に差し替え）
const DUMMY = {
  S: [{ id: "s1", name: "カブト（S）" }, { id: "s2", name: "クワガタ（S）" }],
  A: [{ id: "a1", name: "カブト（A）" }, { id: "a2", name: "クワガタ（A）" }],
  B: [{ id: "b1", name: "カブト（B）" }, { id: "b2", name: "クワガタ（B）" }],
};

export default function BattleItemSelectPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const battleId = useMemo(
    () => state?.battleId || localStorage.getItem(LS_BATTLE_KEY) || "",
    [state?.battleId]
  );
  const questionCount = state?.questionCount ?? 3;

  const preSelected = state?.selectedItem || null;
  const [rank, setRank] = useState("S");
  const [selected, setSelected] = useState(preSelected);

  const onRankClick = (r, e) => {
    // どんな wrap(Link/form) があっても、ここで止める
    e?.preventDefault?.();
    e?.stopPropagation?.();
    console.log("[ItemSelect] rank click:", r);
    setRank(r);
  };

  const onPick = (it, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    console.log("[ItemSelect] pick:", it);
    setSelected(it);
  };

  const confirmAndGo = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!selected) return;
    console.log("[ItemSelect] go play with:", { battleId, selected });
    navigate("/battle/play", {
      state: {
        battleId,
        questionCount,
        selectedItem: selected,
        enemyItem: { id: "cpu", name: `${rank}ランクCPU` }, // 仮の敵
      },
    });
  };

  return (
    <div className="p-6 bg-yellow-50 min-h-screen" onClick={(e)=>e.stopPropagation()}>
      <h2 className="text-lg font-bold mb-3">ランクを選んでバトルキャラを決めよう！</h2>

      {preSelected && (
        <div className="mb-4 p-3 rounded border bg-white">
          <div className="text-sm text-gray-500">図鑑からの選択</div>
          <div className="text-lg font-bold">{preSelected.name}</div>
          <button
            type="button"
            onClick={confirmAndGo}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          >
            このアイテムで対戦開始 →
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-3">
        {["S", "A", "B"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={(e) => onRankClick(r, e)}
            className={`px-3 py-2 rounded border ${rank === r ? "bg-yellow-300" : "bg-white"}`}
          >
            {r}ランクで戦う！
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {DUMMY[rank].map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={(e) => onPick(it, e)}
            className={`p-3 rounded border text-left bg-white ${
              selected?.id === it.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
          >
            {it.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={confirmAndGo}
        disabled={!selected}
        className={`px-4 py-2 rounded ${
          selected ? "bg-green-600 text-white" : "bg-gray-300 text-gray-500"
        }`}
      >
        対戦開始 →
      </button>
    </div>
  );
}
