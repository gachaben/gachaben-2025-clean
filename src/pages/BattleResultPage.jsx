// src/pages/BattleResultPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// 0→target までカウントアップ
function useCountUp(target = 0, ms = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      setVal(Math.round(target * (p * (2 - p)))); // easeOut
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return val;
}

// 簡易紙吹雪（勝利時のみ）
function Confetti({ fire = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const N = 120;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * 40,
      r: 4 + Math.random() * 6,
      vy: 2 + Math.random() * 3,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI,
      vr: -0.2 + Math.random() * 0.4,
      s: 0.8 + Math.random() * 0.6,
    }));

    let raf = 0;
    const colors = ["#60a5fa", "#f97316", "#10b981", "#f43f5e", "#f59e0b", "#a78bfa"];
    const start = performance.now();
    const dur = 1800; // 1.8sで終了

    const draw = (t) => {
      const p = Math.min(1, (t - start) / dur);
      ctx.clearRect(0, 0, w, h);
      parts.forEach((pt, i) => {
        pt.vy += 0.02; // 重力
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.rot += pt.vr;
        if (pt.y > h + 30) {
          pt.y = -20;
          pt.vy = 2 + Math.random() * 3;
          pt.x = Math.random() * w;
        }
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.globalAlpha = 1 - p; // 時間でフェード
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(-pt.r * pt.s, -pt.r * 0.6 * pt.s, pt.r * 2 * pt.s, pt.r * 1.2 * pt.s);
        ctx.restore();
      });
      if (p < 1) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [fire]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden
    />
  );
}

const BattleResultPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    result, // 'win' | 'lose' | 'draw'
    myPwLeft = 0,
    enemyPwLeft = 0,
    myCorrect = 0,
    cpuCorrect = 0,
    questionCount = 3,
    battleId,
  } = state || {};

  // 後方互換：resultが無い場合はここで判定
  const computed = useMemo(() => {
    if (result) return result;
    if (myPwLeft !== enemyPwLeft) return myPwLeft > enemyPwLeft ? "win" : "lose";
    if (myCorrect !== cpuCorrect) return myCorrect > cpuCorrect ? "win" : "lose";
    return "draw";
  }, [result, myPwLeft, enemyPwLeft, myCorrect, cpuCorrect]);

  // Bpt
  const baseBpt = 5;
  const winBonus = computed === "win" ? 10 : 0;
  const gainedBpt = baseBpt + winBonus;

  // カウントアップ値
  const dispMyPw = useCountUp(myPwLeft, 700);
  const dispEnemyPw = useCountUp(enemyPwLeft, 700);
  const dispBpt = useCountUp(gainedBpt, 900);

  // 勝利時に紙吹雪
  const fireConfetti = computed === "win";

  // 遷移ボタン
  const toBattle = () => navigate("/battle", { replace: true });
  const toHome = () => navigate("/", { replace: true });

  const title =
    computed === "win" ? "勝利！" : computed === "lose" ? "敗北…" : "引き分け";
  const titleClass =
    computed === "win"
      ? "text-blue-400 drop-shadow-glow"
      : computed === "lose"
      ? "text-red-500"
      : "text-gray-500";

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 text-gray-900">
      {/* 紙吹雪 */}
      <Confetti fire={fireConfetti} />

      <div className="mx-auto max-w-xl px-5 py-8 animate-fadeIn">
        <h1 className={`text-3xl font-extrabold mb-6 ${titleClass}`}>{title}</h1>

        {/* サマリーカード */}
        <div className="bg-white/90 rounded-2xl shadow p-5 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-gray-500 mb-0.5">あなたの残りPW</div>
              <div className="text-2xl font-bold">{dispMyPw}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">相手の残りPW</div>
              <div className="text-2xl font-bold">{dispEnemyPw}</div>
            </div>
            <div className="col-span-2 text-sm text-gray-600">
              正解数：あなた {myCorrect} / 相手 {cpuCorrect}（全 {questionCount} 問）
            </div>
          </div>
        </div>

        {/* 獲得Bpt */}
        <div className="bg-white rounded-2xl shadow p-5 mb-8 flex items-center gap-3">
          <div className="text-2xl">🎁</div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">
              今回の基本付与：{baseBpt} Bpt{computed === "win" ? "（＋勝利10）" : ""}
            </div>
            <div className="text-2xl font-extrabold">
              合計：<span className="text-emerald-600">{dispBpt}</span> Bpt
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3">
          <button
            onClick={toBattle}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:scale-[1.02] active:scale-[0.99] transition"
          >
            もう一度戦う
          </button>
          <button
            onClick={toHome}
            className="px-4 py-2 rounded-xl bg-gray-300 font-semibold shadow hover:scale-[1.02] active:scale-[0.99] transition"
          >
            ホームへ戻る
          </button>
        </div>

        {/* デバッグ */}
        {battleId && (
          <div className="mt-4 text-xs text-gray-500">battleId: {battleId}</div>
        )}
      </div>
    </div>
  );
};

export default BattleResultPage;
