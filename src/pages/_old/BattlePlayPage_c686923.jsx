// src/pages/BattlePlayPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

// ベット候補
const PW_OPTIONS = [50, 100, 200, 300, 400, 500];

// ダミー問題
const QUESTIONS = [
  { text: "カブトムシの幼虫がよく食べるものは？", options: ["木の葉", "腐葉土", "花の蜜", "昆虫ゼリー"], answer: "腐葉土" },
  { text: "クワガタの大アゴが一番発達しているステージは？", options: ["卵", "幼虫", "さなぎ", "成虫"], answer: "成虫" },
  { text: "アゲハの幼虫の擬態で有名なのは？", options: ["鳥のフン", "枝", "石", "花びら"], answer: "鳥のフン" },
];

// 演出の“間”
const DELAY_CPU_ANSWER_MS = 900; // 自分→CPU
const DELAY_REVEAL_MS = 800;     // CPU→結果

// 中央ゲージ（一本化）
function Gauge({ pct }) {
  const v = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return (
    <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
      <div className="h-full bg-purple-500 transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

// 画面フラッシュ
function FlashOverlay({ color = "rgba(255,255,255,0.85)", show }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
      style={{ background: color, mixBlendMode: "screen" }}
    />
  );
}

// 浮遊テキスト（±）
function FloatText({ text, show, side = "me" }) {
  return (
    <div
      className={`absolute transition-all duration-700 ${show ? "opacity-100 -translate-y-4" : "opacity-0 translate-y-0"} ${
        side === "me" ? "right-6" : "left-6"
      }`}
      style={{ top: "-10px" }}
    >
      <span className="px-2 py-0.5 rounded text-sm font-bold bg-white/90 shadow">{text}</span>
    </div>
  );
}

// 相手側用の表示ボタン（クリック不可）
function EnemyOptionButton({ active, children, correct = null }) {
  const base =
    correct === null
      ? active
        ? "bg-rose-500 text-white border-rose-500"
        : "bg-white"
      : correct
      ? "bg-green-600 text-white border-green-600"
      : active
      ? "bg-red-600 text-white border-red-600"
      : "bg-white";

  return (
    <button type="button" disabled className={`px-3 py-2 rounded border cursor-default ${base}`} aria-disabled="true">
      {children}
    </button>
  );
}

export default function BattlePlayPage() {
  const navigate = useNavigate();
  const loc = useLocation();

  const winSound = useRef(new Audio("/sounds/win.mp3"));
  const questionCount = loc.state?.questionCount ?? 3;

  // 受け取り
  const selectedItem = loc.state?.selectedItem ?? { id: "me", name: "自分の虫", power: 300 };
  const enemyItem = loc.state?.enemyItem ?? { id: "enemy", name: "相手の虫", power: 300 };

  // 残PW
  const [myLeft, setMyLeft] = useState(loc.state?.myPwLeft ?? 300);
  const [enemyLeft, setEnemyLeft] = useState(loc.state?.enemyPwLeft ?? 300);

  // 進行
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("bet"); // 'bet' | 'question' | 'reveal' | 'end'
  const [sudden, setSudden] = useState(false);
  const [suddenCount, setSuddenCount] = useState(0);

  // ベット
  const [pickBet, setPickBet] = useState(null);
  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  // 問題と回答
  const [q, setQ] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [cpuAnswer, setCpuAnswer] = useState(null);
  const [myCorrect, setMyCorrect] = useState(null);
  const [cpuCorrect, setCpuCorrect] = useState(null);

  // 演出
  const cpuTimerRef = useRef(null);
  const revealTimerRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("rgba(255,255,255,0.85)");
  const [floatMy, setFloatMy] = useState("");
  const [floatEnemy, setFloatEnemy] = useState("");

  // 保存済みフラグ
  const [saved, setSaved] = useState(false);

  // %（中央ゲージ）
  const { myPct, enemyPct } = useMemo(() => {
    const total = Math.max(1, myLeft + enemyLeft);
    return { myPct: (myLeft / total) * 100, enemyPct: (enemyLeft / total) * 100 };
  }, [myLeft, enemyLeft]);

  // ラウンド開始時のセットアップ（bet/サドンデス切替にも反応）
  useEffect(() => {
    if (phase !== "bet") return;

    if (!sudden) {
      setPickBet(null);
      setMyBet(null);
      // CPUベット
      const validE = PW_OPTIONS.filter((p) => p > 0 && p <= enemyLeft);
      const pickE = validE.length ? validE[Math.floor(Math.random() * validE.length)] : 0;
      setEnemyBet(pickE || 0);
      setSuddenCount(0);
    } else {
      setSuddenCount((c) => c + 1);
    }

    // 問題セット
    const qIndex = ((round - 1) + suddenCount) % QUESTIONS.length;
    setQ(QUESTIONS[qIndex]);

    // 回答リセット
    setMyAnswer(null);
    setCpuAnswer(null);
    setMyCorrect(null);
    setCpuCorrect(null);

    if (sudden) setPhase("question");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sudden, enemyLeft, round, suddenCount]);



// 追加：テスト書き込み関数
const writeTest = async () => {
  try {
    const ref = await addDoc(collection(db, "battles_test"), {
      ok: true,
      at: serverTimestamp(),
    });
    console.log("🧪 test write ok:", ref.id);
  } catch (e) {
    console.error("🧪 test write NG:", e);
  }
};




  // 「試合終了」になったら一度だけ保存
  useEffect(() => {
    if (phase === "end" && !saved) {
      console.log("🏁 phase is 'end' & not saved yet → saving...");
      saveBattleRecord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, saved]);

  // タイマー掃除
  useEffect(() => {
    return () => {
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  // ベット確定
  const confirmBetAndStart = () => {
    if (pickBet == null) return;
    setMyBet(pickBet);
    setPhase("question");
  };

  // 解答（自分→待→相手→待→結果）
  const handleAnswer = (opt) => {
    if (!q || phase !== "question" || myAnswer) return;

    const meOK = opt === q.answer;
    setMyAnswer(opt);
    setMyCorrect(meOK);

    cpuTimerRef.current = setTimeout(() => {
      const cpuIsCorrect = Math.random() < 0.6;
      setCpuCorrect(cpuIsCorrect);
      setCpuAnswer(cpuIsCorrect ? q.answer : pickRandomWrong(q));

      revealTimerRef.current = setTimeout(() => {
        resolveRound(meOK, cpuIsCorrect);
      }, DELAY_REVEAL_MS);
    }, DELAY_CPU_ANSWER_MS);
  };

  const pickRandomWrong = (question) => {
    const wrongs = question.options.filter((o) => o !== question.answer);
    return wrongs[Math.floor(Math.random() * wrongs.length)];
  };

  // 判定
  const resolveRound = (meOK, cpuOK) => {
    setFloatMy("");
    setFloatEnemy("");

    if (meOK && !cpuOK) {
      const amt = myBet || 0;
      setEnemyLeft((prev) => Math.max(0, prev - amt));
      setMyLeft((prev) => prev + amt);
      setFloatMy(`+${amt}`);
      setFloatEnemy(`-${amt}`);
      triggerFlash("rgba(56,189,248,0.85)");
      setPhase("reveal");
      setSudden(false);
    } else if (!meOK && cpuOK) {
      const amt = enemyBet || 0;
      setMyLeft((prev) => Math.max(0, prev - amt));
      setEnemyLeft((prev) => prev + amt);
      setFloatMy(`-${amt}`);
      setFloatEnemy(`+${amt}`);
      triggerFlash("rgba(244,63,94,0.85)");
      setPhase("reveal");
      setSudden(false);
    } else if (meOK && cpuOK) {
      setSudden(true);
      setPhase("bet");
      triggerFlash("rgba(250,204,21,0.6)");
    } else {
      setPhase("reveal");
      setSudden(false);
    }
  };

  const triggerFlash = (color) => {
    setFlashColor(color || "rgba(255,255,255,0.85)");
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  // ★ 試合結果をFirestoreに記録
  const saveBattleRecord = async () => {
    try {
      const uid = getAuth().currentUser?.uid ?? "anon";
      const payload = {
        uid,
        me: {
          name: selectedItem?.name ?? "unknown",
          start: loc.state?.myPwLeft ?? 300,
          end: myLeft,
        },
        enemy: {
          name: enemyItem?.name ?? "CPU",
          start: loc.state?.enemyPwLeft ?? 300,
          end: enemyLeft,
        },
        roundsPlayed: round,
        questionCount,
        winner: myLeft > enemyLeft ? "me" : (myLeft < enemyLeft ? "enemy" : "draw"),
        createdAt: serverTimestamp(),
      };
      console.log("📝 saveBattleRecord payload:", payload);

      const ref = await addDoc(collection(db, "battles"), payload);
      console.log("✅ battles written docId:", ref.id);
      setSaved(true);
    } catch (e) {
      console.error("❌ save battle failed:", e);
    }
  };

  const nextStep = () => {
    const isFinished = myLeft <= 0 || enemyLeft <= 0 || round >= questionCount;
    if (isFinished) {
      if (myLeft > enemyLeft) {
        try {
          winSound.current.currentTime = 0;
          winSound.current.play();
        } catch {}
      }
      // ここでは保存しない（phaseが'end'になったらuseEffectで一度だけ保存）
      setPhase("end");
      return;
    }
    setRound((r) => r + 1);
    setSudden(false);
    setSuddenCount(0);
    setPhase("bet");
  };

  const resetMatch = () => {
    setMyLeft(loc.state?.myPwLeft ?? 300);
    setEnemyLeft(loc.state?.enemyPwLeft ?? 300);
    setRound(1);
    setSudden(false);
    setSuddenCount(0);
    setPickBet(null);
    setMyBet(null);
    setEnemyBet(null);
    setPhase("bet");
    setSaved(false);
  };

  const myValidOptions = PW_OPTIONS.filter((p) => p > 0 && p <= myLeft);
  const enemyValidOptions = PW_OPTIONS.filter((p) => p > 0 && p <= enemyLeft);

  return (
    <div className="relative min-h-screen w-full mx-auto max-w-5xl px-4 py-6 grid grid-rows-[auto_1fr_auto_1fr_auto] gap-6">
      <FlashOverlay color={flashColor} show={flash} />

      {/* ヘッダー */}
      <header className="row-start-1 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">バトル（{questionCount}問） Round {round}/{questionCount}</h1>
        <div />
      </header>

      {/* 相手（ミラーUI） */}
      <section className="row-start-2 flex flex-col items-center gap-2 relative">
        <div className="text-gray-600 text-sm">相手</div>
        <div className="text-lg font-semibold">{enemyItem.name}</div>
        <div className="text-sm text-gray-500">残PW: {enemyLeft}</div>
        <div className="w-full relative h-0">
          <FloatText text={floatEnemy} show={!!floatEnemy} side="enemy" />
        </div>

        {/* 相手のベット（表示用） */}
        {phase === "bet" && !sudden && (
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {enemyValidOptions.length ? (
              enemyValidOptions.map((p) => (
                <EnemyOptionButton key={p} active={enemyBet === p}>
                  {p} PW
                </EnemyOptionButton>
              ))
            ) : (
              <div className="text-xs text-gray-400">賭けられるPWがありません</div>
            )}
          </div>
        )}

        {/* 相手の問題選択（表示用） */}
        {phase === "question" && q && (
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {q.options.map((opt) => {
              const active = cpuAnswer === opt;
              const showCorrect =
                cpuAnswer != null ? (cpuCorrect && active ? true : cpuCorrect === false && active ? false : null) : null;
              return (
                <EnemyOptionButton key={opt} active={active} correct={showCorrect}>
                  {opt}
                </EnemyOptionButton>
              );
            })}
          </div>
        )}

        {(phase !== "bet" || sudden) && enemyBet != null && (
          <div className="text-xs text-gray-400">
            このラウンドの相手ベット: {enemyBet}
            {sudden && "（サドンデス継続）"}
          </div>
        )}
      </section>

      {/* 中央ゲージ */}
      <section className="row-start-3">
        <div className="text-center text-sm text-gray-600 mb-2">ゲージ</div>
        <Gauge pct={myPct} />
        <div className="mt-1 text-center text-xs text-gray-500">
          あなた {Math.round(myPct)}% / 相手 {Math.round(enemyPct)}%
        </div>
        {sudden && (
          <div className="mt-2 flex items-center justify-center">
            <span className="animate-pulse px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold">
              サドンデス中！ 同じベットで続行（{suddenCount + 1}問目）
            </span>
          </div>
        )}
      </section>

      {/* 自分（操作UI） */}
      <section className="row-start-4 flex flex-col items-center gap-2 relative">
        <div className="text-gray-600 text-sm">あなた</div>
        <div className="text-lg font-semibold">{selectedItem.name}</div>
        <div className="text-sm text-gray-500">残PW: {myLeft}</div>
        <div className="w-full relative h-0">
          <FloatText text={floatMy} show={!!floatMy} side="me" />
        </div>

        {/* 自分のベット */}
        {phase === "bet" && !sudden && (
          <>
            <div className="text-sm text-gray-600">このラウンドで賭けるPWを選んで「このPWで開始」を押してね</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {myValidOptions.length ? (
                myValidOptions.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPickBet(p)}
                    className={`px-4 py-2 rounded border ${
                      pickBet === p ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {p} PW
                  </button>
                ))
              ) : (
                <div className="text-sm text-red-500">賭けられるPWがありません</div>
              )}
            </div>
            <button onClick={confirmBetAndStart} disabled={pickBet == null} className="px-5 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
              このPWで開始
            </button>
          </>
        )}

        {/* 自分の問題UI */}
        {phase === "question" && q && (
          <>
            <div className="text-base font-semibold">
              {sudden ? "【サドンデス】" : null} {q.text}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {q.options.map((opt) => {
                const isMine = myAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!myAnswer}
                    className={`px-4 py-2 rounded border ${
                      isMine ? "bg-green-600 text-white border-green-600" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-2">答えると少し遅れて相手も解答します…</div>
          </>
        )}

        {(phase !== "bet" || sudden) && myBet != null && (
          <div className="text-xs text-gray-400">
            このラウンドの自分ベット: {myBet}
            {sudden && "（サドンデス継続）"}
          </div>
        )}
      </section>

      {/* 結果/終了 */}
      <footer className="row-start-5 flex flex-col items-center justify-center gap-4">
        {phase === "reveal" && (
          <div className="w-full max-w-xl text-center">
            <div className="mb-2 text-sm text-gray-600">{sudden ? "サドンデス結果" : "このラウンドの結果"}</div>
            <div className="p-3 rounded bg-gray-50 border">
              <div className="mb-1">あなた：{toResultText(myCorrect)}（ベット {myBet ?? 0}）</div>
              <div className="mb-1">相手　：{toResultText(cpuCorrect)}（ベット {enemyBet ?? 0}）</div>
              <div className="text-xs text-gray-500">勝者は自分のベット分だけ相手のPWを奪い、自分のPWに加算します</div>
            </div>
            <button onClick={nextStep} className="mt-3 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
              次へ
            </button>
          </div>
        )}

        {phase === "end" && (
          <div className="w-full max-w-xl text-center">
            <div className="text-xl font-bold mb-2">試合終了！</div>
            <div className="mb-2">
              あなた {myLeft} PW / 相手 {enemyLeft} PW
            </div>
            <div className="mb-4 text-lg">{myLeft > enemyLeft ? "あなたの勝ち！" : (myLeft < enemyLeft ? "あなたの負け…" : "引き分け")}</div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button onClick={resetMatch} className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200">
                もう一度
              </button>
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
                準備画面へ戻る
              </button>
              <button onClick={writeTest} className="px-4 py-2 rounded bg-emerald-500 text-white">
  テスト書き込み
</button>

            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

function toResultText(b) {
  return b == null ? "-" : b ? "正解" : "不正解";
}
