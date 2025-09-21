// src/pages/BattlePage.jsx
import React, { useMemo, useState } from "react";

const HANDS = [
  { key: "g", label: "グー" },
  { key: "c", label: "チョキ" },
  { key: "p", label: "パー"  },
];

const REVEAL_DELAY_MS = 120;  // 選択直後に同時公開
const RESULT_DELAY_MS = 800;  // 少し待って勝敗表示

function judge(user, cpu) {
  if (user === cpu) return "draw";
  if (
    (user === "g" && cpu === "c") ||
    (user === "c" && cpu === "p") ||
    (user === "p" && cpu === "g")
  ) return "win";
  return "lose";
}

export default function BattlePage({ onDecided }) {
  // phase: idle -> reveal(ポン！＆同時公開) -> result(勝敗表示)
  const [phase, setPhase] = useState("idle");
  const [userPick, setUserPick] = useState(null);
  const [cpuPick, setCpuPick] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const resultText = useMemo(() => {
    if (result === "win")  return "あなたの勝ち！";
    if (result === "lose") return "相手の勝ち！";
    if (result === "draw") return "あいこ！";
    return "";
  }, [result]);

  const nextCpu = () => HANDS[Math.floor(Math.random() * HANDS.length)].key;

  function handlePick(key) {
    if (busy || phase !== "idle") return;
    setBusy(true);

    const cpu = nextCpu();
    setUserPick(key);

    // すぐ（120ms）で両者の手を出す & 「ポン！」表示へ
    setTimeout(() => {
      setCpuPick(cpu);
      setPhase("reveal");
    }, REVEAL_DELAY_MS);

    // 少し後に勝敗表示
    setTimeout(() => {
      const r = judge(key, cpu);
      setResult(r);
      setPhase("result");
      setBusy(false);
    }, REVEAL_DELAY_MS + RESULT_DELAY_MS);
  }

  function reset() {
    setPhase("idle");
    setUserPick(null);
    setCpuPick(null);
    setResult(null);
    setBusy(false);
  }

  const ChoiceRow = ({ disabled, onPick }) => (
    <div className="flex gap-2 justify-center">
      {HANDS.map(({ key, label }) => (
        <button
          key={key}
          disabled={disabled}
          onClick={() => onPick?.(key)}
          className={`px-3 py-1.5 rounded border text-sm
            ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 中央タイトル：最初は「じゃんけん」→ 選んだら自分の手だけを中央表示 */}
      <div className="flex justify-center h-8 items-center">
        {phase === "idle"
          ? <div className="text-xl font-bold tracking-wide">じゃんけん</div>
          : <div className="text-xl font-extrabold">
              {HANDS.find(h => h.key === userPick)?.label}
            </div>}
      </div>

      {/* 相手エリア：最初は三択（押せない）→ ポン後は相手の手のみ大きく表示 */}
      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm text-gray-500 mb-2">相手（他ユーザー）</div>
        {phase === "idle"
          ? <ChoiceRow disabled onPick={null} />
          : <div className="h-20 flex items-center justify-center text-2xl font-bold">
              {HANDS.find(h => h.key === cpuPick)?.label ?? "…"}
            </div>}
      </div>

      {/* 中央の演出：reveal中は「ポン！」、resultで勝敗バッジ */}
      <div className="flex justify-center h-7 items-center">
        {phase === "reveal" && (
          <div className="px-3 py-1 rounded-full bg-gray-800 text-white text-sm animate-bounce">
            ポン！
          </div>
        )}
        {phase === "result" && (
          <div className={`px-3 py-1 rounded-full text-white text-sm
            ${result === "win" ? "bg-emerald-600" :
               result === "lose" ? "bg-rose-600" : "bg-gray-600"}`}>
            {resultText}
          </div>
        )}
      </div>

      {/* あなたエリア：最初は三択（押せる）→ ポン後は自分の手を大きく表示 */}
      <div className="rounded-lg border bg-white p-4">
        <div className="text-sm text-gray-500 mb-2">あなた</div>

        {phase === "idle"
          ? <ChoiceRow disabled={busy} onPick={handlePick} />
          : <div className="h-20 flex items-center justify-center text-2xl font-bold">
              {HANDS.find(h => h.key === userPick)?.label ?? "…"}
            </div>}

        <div className="mt-4 flex gap-2 justify-center">
          {phase === "result"
            ? (<>
                <button
                  onClick={() => {
                    if (result === "draw") {
                      reset();
                    } else {
                      onDecided?.({
                        winner: result === "win" ? "you" : "opponent",
                        userHand: userPick,
                        cpuHand: cpuPick,
                      });
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white"
                >
                  {result === "draw" ? "もう一回" : "次へ"}
                </button>
                <button onClick={reset} className="px-3 py-1.5 rounded border">
                  リセット
                </button>
              </>)
            : <span className="text-xs text-gray-500 select-none">
                手を選ぶと「ポン！」→ 少し間をおいて勝敗が出ます
              </span>}
        </div>
      </div>
    </div>
  );
}
