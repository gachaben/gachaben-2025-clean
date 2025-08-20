// src/pages/BattleResultPage.jsx
import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function BattleResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  // バトル側（onBattleFinish）が渡すキーに合わせる
  const winner = state?.winner ?? "unknown";
  const my = Number(state?.myFinalLeft ?? 0);
  const en = Number(state?.enemyFinalLeft ?? 0);
  const roundsPlayed = Number(state?.roundsPlayed ?? 0);
  const selectedItem = state?.selectedItem ?? { name: "あなた" };
  const enemyItem = state?.enemyItem ?? { name: "あいて" };

  const label =
    my > en ? "あなたの勝ち！" : my < en ? "あなたの負け…" : "引き分け";

  return (
    <div className="p-6">
      <header className="mb-4 flex items-center justify-between">
        <button className="px-3 py-1 rounded bg-gray-200" onClick={() => navigate(-1)}>
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">バトル結果</h1>
        <div />
      </header>

      <section className="rounded border p-4 bg-white">
        <div className="text-lg font-bold mb-1">{label}</div>
        <div className="text-sm text-gray-600 mb-3">
          ラウンド数: {roundsPlayed} / 最終PW: あなた {my} / 相手 {en}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">あなた</div>
            <div className="font-semibold">{selectedItem?.name ?? "あなた"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-xs text-gray-500 mb-1">相手</div>
            <div className="font-semibold">{enemyItem?.name ?? "あいて"}</div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex gap-2 flex-wrap">
        <Link className="px-3 py-2 rounded bg-blue-600 text-white" to="/battle">
          もう一度バトル
        </Link>
        <Link className="px-3 py-2 rounded bg-indigo-600 text-white" to="/review">
          復習へ
        </Link>
        <Link className="px-3 py-2 rounded bg-gray-200" to="/">
          ホーム
        </Link>
      </div>
    </div>
  );
}
