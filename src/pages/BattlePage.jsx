// src/pages/BattlePage.jsx
import React, { useState } from "react";

// 手アイコンの画像パス（public/ 以下）
const HAND_IMG = {
  g: "/images/janken/gu.png",
  c: "/images/janken/choki.png",
  p: "/images/janken/pa.png",
};
const HANDS = ["g", "c", "p"];

// 画像
function HandImage({ hand, size = 64, alt = "" }) {
  if (!hand) return null;
  return (
    <img
      src={HAND_IMG[hand]}
      alt={alt}
      width={size}
      height={size}
      className="select-none"
      draggable={false}
    />
  );
}

// 三つの手を横一列に描く行
function HandRow({
  selected,           // 'g' | 'c' | 'p' | null
  disabled = false,   // クリック可否
  onPick,             // (key) => void
}) {
  const clickable = !!onPick && !disabled;

  return (
    <div className="flex items-center justify-center gap-6">
      {HANDS.map((key) => {
        const isPicked = selected === key;
        const isDim = selected && selected !== key;

        return (
          <button
            key={key}
            type="button"
            onClick={clickable ? () => onPick(key) : undefined}
            disabled={!clickable}
            className={[
              "rounded-lg border p-3 w-20 h-20 flex items-center justify-center transition",
              clickable ? "hover:bg-gray-50 active:scale-[0.98]" : "cursor-default",
              isPicked ? "ring-2 ring-blue-500 bg-white" : "",
              isDim ? "opacity-30" : "",
            ].join(" ")}
            aria-label={key}
          >
            <HandImage hand={key} size={48} alt={key} />
          </button>
        );
      })}
    </div>
  );
}

// 勝敗
function judge(user, cpu) {
  if (user === cpu) return "draw";
  if ((user === "g" && cpu === "c") || (user === "c" && cpu === "p") || (user === "p" && cpu === "g")) {
    return "win";
  }
  return "lose";
}

export default function BattlePage() {
  const [userPick, setUserPick] = useState(null);  // 'g'|'c'|'p'|null
  const [cpuPick, setCpuPick] = useState(null);
  const [result, setResult] = useState(null);

  const handlePick = (hand) => {
    // 自分が選んだ瞬間に相手の手も決定＆ハイライト表示
    const cpu = HANDS[Math.floor(Math.random() * HANDS.length)];
    setUserPick(hand);
    setCpuPick(cpu);
    setResult(null);

    // 少し「タメ」を置いて勝敗表示
    setTimeout(() => setResult(judge(hand, cpu)), 700);
  };

  const reset = () => {
    setUserPick(null);
    setCpuPick(null);
    setResult(null);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-bold">Battle</h1>
      {!userPick && <div className="text-center text-xl font-bold">じゃんけん</div>}

      {/* 相手 */}
      <section className="border rounded-lg bg-gray-50 p-4">
        <div className="text-sm text-gray-500 mb-2">相手（CPU）</div>
        <div className="min-h-28 flex items-center justify-center">
          <HandRow selected={cpuPick} disabled />
        </div>
      </section>

      {/* あなた */}
      <section className="border rounded-lg bg-gray-50 p-4">
        <div className="text-sm text-gray-500 mb-2">あなた</div>
        <div className="min-h-28 flex items-center justify-center">
          <HandRow
            selected={userPick}
            disabled={!!userPick}          // 選んだら固定
            onPick={handlePick}            // クリックで決定
          />
        </div>

        {/* コントロール */}
        {userPick && (
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={reset} className="px-3 py-1.5 rounded border">もう一度</button>
          </div>
        )}
      </section>

      {/* 勝敗 */}
      {result && (
        <div className="text-center text-xl font-bold">
          {result === "win"  && <span className="text-emerald-600">あなたの勝ち！</span>}
          {result === "lose" && <span className="text-rose-600">あなたの負け…</span>}
          {result === "draw" && <span className="text-gray-600">あいこ！</span>}
        </div>
      )}
    </div>
  );
}
