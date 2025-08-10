// src/pages/BattlePage.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const PW_OPTIONS = [100, 200, 300, 400, 500];

export default function BattlePage() {
  const nav = useNavigate();
  const loc = useLocation();

  const selectedItem = loc.state?.selectedItem || null; // 自分
  const enemyItem    = loc.state?.enemyItem    || null; // 相手
  const round        = loc.state?.round        ?? 1;
  const totalRounds  = loc.state?.totalRounds  ?? 3;

  // ★ 選択なしで直アクセスなら item-select へ強制送還
  useEffect(() => {
    if (!selectedItem) {
      nav("/battle/item-select", { replace: true });
    }
  }, [selectedItem, nav]);

  if (!selectedItem) return null;

  // --- デモ用の残PW（既存ロジックに置換OK） ---
  const [myPwLeft, setMyPwLeft]       = useState(loc.state?.myPwLeft ?? 300);
  const [enemyPwLeft, setEnemyPwLeft] = useState(loc.state?.enemyPwLeft ?? 300);
  const [myBet, setMyBet]             = useState(null);
  const [log, setLog]                 = useState([]);

  const { myPct, enemyPct } = useMemo(() => {
    const total = Math.max(1, myPwLeft + enemyPwLeft);
    return {
      myPct: Math.round((myPwLeft / total) * 100),
      enemyPct: Math.round((enemyPwLeft / total) * 100),
    };
  }, [myPwLeft, enemyPwLeft]);

  const handleBet = (v) => {
    setMyBet(v);
    setLog((l) => [...l, `自分が ${v} PW をベット`]);
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] w-full mx-auto max-w-5xl px-4 py-6
                 grid grid-rows-[auto_auto_auto_1fr_auto] gap-4"
    >
      {/* 1: タイトル */}
      <header className="row-start-1 text-center">
        <h1 className="text-xl font-bold">バトル Round {round} / {totalRounds}</h1>
      </header>

      {/* 2: 上=相手 */}
      <section className="row-start-2 flex justify-center">
        <ItemCard item={enemyItem} owned={true} />
      </section>

      {/* 3: 中央=ゲージ（ここが固定行） */}
      <section className="row-start-3">
        <CenterGauge
          myLabel={selectedItem?.name ?? "自分"}
          enemyLabel={enemyItem?.name ?? "相手"}
          myPct={myPct}
          enemyPct={enemyPct}
          myPwLeft={myPwLeft}
          enemyPwLeft={enemyPwLeft}
        />
      </section>

      {/* 4: 下=自分 */}
      <section className="row-start-4 flex justify-center">
        <ItemCard item={selectedItem} owned={true} />
      </section>

      {/* 5: 操作＆ログ */}
      <footer className="row-start-5">
        {/* PWボタン群（あとで実処理につなげてOK） */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {PW_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => handleBet(v)}
              className={`px-4 py-2 rounded-xl shadow bg-white/80 hover:bg-white
                          ${myBet === v ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
            >
              {v} PW
            </button>
          ))}
        </div>

        {/* バトルログ */}
        <div className="mt-4 max-h-40 overflow-auto rounded-lg bg-black/5 p-3 text-sm">
          {log.length === 0 ? (
            <p className="text-gray-500">ログはまだありません。</p>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {log.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          )}
        </div>
      </footer>
    </div>
  );
}

function CenterGauge({ myLabel, enemyLabel, myPct, enemyPct, myPwLeft, enemyPwLeft }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between text-xs md:text-sm mb-1 px-1">
        <span className="font-medium">{enemyLabel}（残PW: {enemyPwLeft}）</span>
        <span className="font-medium">{myLabel}（残PW: {myPwLeft}）</span>
      </div>

      <div className="relative h-5 md:h-6 rounded-full bg-gray-200 overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-gray-400 transition-all" style={{ width: `${enemyPct}%` }} />
        <div className="absolute right-0 top-0 h-full bg-blue-500/70 transition-all" style={{ width: `${myPct}%` }} />
        <div className="absolute inset-y-0 left-1/2 w-[2px] bg-white/80 pointer-events-none" />
      </div>

      <div className="flex justify-between text-[11px] md:text-xs mt-1 px-1">
        <span>{enemyPct}%</span>
        <span>{myPct}%</span>
      </div>
    </div>
  );
}
