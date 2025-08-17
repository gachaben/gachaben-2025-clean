import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

export default function BattlePlayPage() {
  const nav = useNavigate();
  const { state } = useLocation() || {};

  // --- 受け取り or フォールバック ---
  const fallbackMe = {
    itemId: "2508_S_001_kabuto_stage1",
    name: "カブト",
    pw: 300,
    rank: "S",
    stage: 1,
    imageName: "2508_S_001_kabuto_stage1.png",
    seriesId: "2508",
    cpt: 120,
    bpt: 90,
  };
  const fallbackEnemy = {
    id: "cpu001",
    name: "カブトムシくん",
    power: 300,
    item: {
      itemId: "2508_A_005_kabuto_stage1",
      name: "カブト（CPU）",
      pw: 300,
      rank: "A",
      stage: 1,
      imageName: "2508_A_005_kabuto_stage1.png",
      seriesId: "2508",
      cpt: 100,
      bpt: 80,
    },
  };

  const me = state?.selectedItem ?? fallbackMe;
  const enemy = state?.enemyItem ?? fallbackEnemy;
  const totalRounds = Math.max(1, Number(state?.questionCount ?? 3));

  // 残PW
  const [myPwLeft, setMyPwLeft] = useState(Number(state?.myPwLeft ?? me.pw ?? 300));
  const [enemyPwLeft, setEnemyPwLeft] = useState(Number(state?.enemyPwLeft ?? enemy.power ?? 300));
  const [round, setRound] = useState(1);
  const [locked, setLocked] = useState(false); // 演出中ロック

  // 勝敗サウンド（任意。ファイルが無くてもエラーにしない）
  const playSafe = (src) => {
    try {
      const a = new Audio(src);
      a.volume = 0.6;
      a.play().catch(() => {});
    } catch (_) {}
  };

  // PW選択（攻撃）
  const handleAttack = (cost) => {
    if (locked || round > totalRounds) return;
    if (myPwLeft < cost) return;

    setLocked(true);
    // 単純な判定：自分のコスト ＞ CPU乱数 なら命中（演出は超簡易）
    const cpu = Math.random() < 0.5 ? 100 : 200;
    const hit = cost >= cpu;

    setTimeout(() => {
      setMyPwLeft((v) => v - cost);
      if (hit) {
        setEnemyPwLeft((v) => Math.max(0, v - cost));
        playSafe("/sounds/hit.mp3"); // 任意。無い場合は何も起きません
      } else {
        playSafe("/sounds/miss.mp3");
      }
      setRound((r) => r + 1);
      setLocked(false);
    }, 350);
  };

  // 進行状況
  const result = useMemo(() => {
    if (round <= totalRounds && enemyPwLeft > 0 && myPwLeft > 0) return null;
    // 終了
    if (enemyPwLeft <= 0 && myPwLeft <= 0) return "draw";
    if (enemyPwLeft <= 0) return "win";
    if (myPwLeft <= 0) return "lose";
    if (round > totalRounds) {
      if (myPwLeft > enemyPwLeft) return "win";
      if (myPwLeft < enemyPwLeft) return "lose";
      return "draw";
    }
    return null;
  }, [round, totalRounds, enemyPwLeft, myPwLeft]);

  useEffect(() => {
    if (!result) return;
    if (result === "win") playSafe("/sounds/win.mp3");
    if (result === "lose") playSafe("/sounds/lose.mp3");
  }, [result]);

  // ゲージ共通
  const Bar = ({ now, max = 1000, colorFrom, colorTo, label }) => {
    const pct = Math.max(0, Math.min(100, Math.round((now / max) * 100)));
    return (
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{label}</span>
          <span className="font-semibold">{now}</span>
        </div>
        <div className="h-3 rounded bg-gray-200 overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => nav(-1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
          ← 戻る
        </button>
        <h1 className="text-xl md:text-2xl font-bold">バトル（{totalRounds}問）　Round {Math.min(round, totalRounds)}/{totalRounds}</h1>
        <div />
      </header>

      {/* 上：相手カード */}
      <section className="mb-6">
        <div className="text-sm text-gray-600 mb-2">相手</div>
        <div className="flex items-center gap-4">
          <ItemCard item={enemy.item ?? enemy} owned={true} pwMode={false} />
          <div className="flex-1 max-w-[520px]">
            <Bar now={enemyPwLeft} max={600} colorFrom="#ef4444" colorTo="#f97316" label="相手PW" />
          </div>
        </div>
      </section>

      {/* 下：自分カード */}
      <section className="mb-6">
        <div className="text-sm text-gray-600 mb-2">あなた</div>
        <div className="flex items-center gap-4">
          <ItemCard item={me} owned={true} pwMode={false} />
          <div className="flex-1 max-w-[520px]">
            <Bar now={myPwLeft} max={600} colorFrom="#22c55e" colorTo="#06b6d4" label="残PW" />
          </div>
        </div>
      </section>

      {/* 操作エリア */}
      {!result ? (
        <section className="mb-10">
          <div className="text-sm font-bold mb-2">このラウンドで使うPWを選んでね（残：{myPwLeft}）</div>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 300].map((n) => (
              <button
                key={n}
                disabled={locked || myPwLeft < n}
                onClick={() => handleAttack(n)}
                className={`px-4 py-2 rounded-full border font-bold disabled:opacity-40 disabled:cursor-not-allowed ${
                  myPwLeft >= n
                    ? "bg-white text-blue-700 border-blue-600 hover:bg-blue-50"
                    : "bg-white text-gray-400 border-gray-300"
                }`}
              >
                {n} PW
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-6">
          <div
            className={`inline-block px-4 py-2 rounded text-white font-bold ${
              result === "win" ? "bg-emerald-600" : result === "lose" ? "bg-rose-600" : "bg-gray-600"
            }`}
          >
            {result === "win" ? "勝ち！" : result === "lose" ? "負け…" : "引き分け"}
          </div>
          <div className="mt-4">
            <button
              onClick={() => nav("/battle")}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
            >
              準備画面へ戻る
            </button>
          </div>
        </section>
      )}

      {/* デバッグリンク群（任意） */}
      <div className="mt-10 text-sm space-x-3">
        <a className="underline" href="/login">ログイン</a>
        <a className="underline" href="/review">復習へ</a>
        <a className="underline" href="/zukan">図鑑トップ</a>
        <a className="underline" href="/admin/data">管理</a>
      </div>
    </div>
  );
}
