import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ベット候補
const PW_OPTIONS = [100, 200, 300, 400, 500];

// ダミー問題（必要に応じて差し替え／API化OK）
const QUESTIONS = [
  {
    text: "カブトムシの幼虫がよく食べるものは？",
    options: ["木の葉", "腐葉土", "花の蜜", "昆虫ゼリー"],
    answer: "腐葉土",
  },
  {
    text: "クワガタの大アゴが一番発達しているステージは？",
    options: ["卵", "幼虫", "さなぎ", "成虫"],
    answer: "成虫",
  },
  {
    text: "アゲハの幼虫の擬態で有名なのは？",
    options: ["鳥のフン", "枝", "石", "花びら"],
    answer: "鳥のフン",
  },
];

// ===== 簡易ゲージ =====
function Gauge({ pct }) {
  const v = Math.max(0, Math.min(100, Math.round(pct || 0)));
  return (
    <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
      <div
        className="h-full bg-purple-500 transition-all"
        style={{ width: `${v}%` }}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

// ===== 画面フラッシュ（勝者側カラーで点滅）=====
function FlashOverlay({ color = "rgba(255,255,255,0.85)", show }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      style={{ background: color, mixBlendMode: "screen" }}
    />
  );
}

// ===== 浮遊テキスト（±ダメージ/回復）=====
function FloatText({ text, show, side = "me" }) {
  return (
    <div
      className={`absolute transition-all duration-700 ${
        show ? "opacity-100 -translate-y-4" : "opacity-0 translate-y-0"
      } ${side === "me" ? "right-6" : "left-6"}`}
      style={{ top: "-10px" }}
    >
      <span className="px-2 py-0.5 rounded text-sm font-bold bg-white/90 shadow">
        {text}
      </span>
    </div>
  );
}

export default function BattlePlayPage() {
  const navigate = useNavigate();
  const loc = useLocation();

  // 勝利SE
  const winSound = useRef(new Audio("/sounds/win.mp3"));

  const questionCount = loc.state?.questionCount ?? 3;

  // 受け取り（なければダミー）
  const selectedItem =
    loc.state?.selectedItem ?? { id: "me", name: "自分の虫", power: 300 };
  const enemyItem =
    loc.state?.enemyItem ?? { id: "enemy", name: "相手の虫", power: 300 };

  // 残PW
  const [myLeft, setMyLeft] = useState(loc.state?.myPwLeft ?? 300);
  const [enemyLeft, setEnemyLeft] = useState(loc.state?.enemyPwLeft ?? 300);

  // 進行
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("bet"); // 'bet' | 'question' | 'reveal' | 'end'
  const [sudden, setSudden] = useState(false); // サドンデス中か
  const [suddenCount, setSuddenCount] = useState(0);

  // ベット
  const [myBet, setMyBet] = useState(null);
  const [enemyBet, setEnemyBet] = useState(null);

  // 問題と回答
  const [q, setQ] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [cpuAnswer, setCpuAnswer] = useState(null);
  const [myCorrect, setMyCorrect] = useState(null);
  const [cpuCorrect, setCpuCorrect] = useState(null);

  // UI演出
  const cpuTimerRef = useRef(null);
  const [flash, setFlash] = useState(false);
  const [flashColor, setFlashColor] = useState("rgba(255,255,255,0.85)");
  const [floatMy, setFloatMy] = useState("");       // 例: "+200" / "-100"
  const [floatEnemy, setFloatEnemy] = useState(""); // 例: "+200" / "-100"

  // %計算（中央ゲージ表示用）
  const { myPct, enemyPct } = useMemo(() => {
    const total = Math.max(1, myLeft + enemyLeft);
    return {
      myPct: (myLeft / total) * 100,
      enemyPct: (enemyLeft / total) * 100,
    };
  }, [myLeft, enemyLeft]);

  // ラウンド開始：ベットフェーズ初期化（サドンデス中はベットを維持して問題を更新）
  useEffect(() => {
    if (phase !== "bet" && !sudden) return;

    if (!sudden) {
      // 通常ラウンド開始：ベットをリセット
      setMyBet(null);
      // CPUベット（残量以内でランダム）
      const valid = PW_OPTIONS.filter((p) => p <= enemyLeft && p > 0);
      const pick =
        valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : 0;
      setEnemyBet(pick || 0);
      setSuddenCount(0);
    } else {
      // サドンデス継続：ベットは据え置き、カウントだけ増やす
      setSuddenCount((c) => c + 1);
    }

    // 問題をセット（ラウンドとサドンデス回数で回す）
    const qIndex = ((round - 1) + suddenCount) % QUESTIONS.length;
    setQ(QUESTIONS[qIndex]);

    // 回答リセット
    setMyAnswer(null);
    setCpuAnswer(null);
    setMyCorrect(null);
    setCpuCorrect(null);

    // フェーズ遷移（サドンデス時は即問題へ）
    if (sudden) {
      setPhase("question");
    }
  }, [phase, sudden]); // eslint-disable-line react-hooks/exhaustive-deps

  // 片付け
  useEffect(() => {
    return () => {
      if (cpuTimerRef.current) {
        clearTimeout(cpuTimerRef.current);
      }
    };
  }, []);

  // 自分がベットしたら問題フェーズへ
  const handlePickBet = (bet) => {
    setMyBet(bet);
    setPhase("question");
  };

  // 自分が回答 → CPU回答を少し遅らせて実行 → 判定へ
  const handleAnswer = (opt) => {
    if (!q || phase !== "question") return;
    const correct = opt === q.answer;
    setMyAnswer(opt);
    setMyCorrect(correct);

    // CPUの正答率（仮）: 60%
    const cpuDelayMs = 600 + Math.random() * 700;
    cpuTimerRef.current = setTimeout(() => {
      const cpuIsCorrect = Math.random() < 0.6;
      setCpuCorrect(cpuIsCorrect);
      // CPUの選択肢表示用
      setCpuAnswer(cpuIsCorrect ? q.answer : pickRandomWrong(q));

      // ダメージ計算 / 転送 or サドンデス
      resolveRound(correct, cpuIsCorrect);
    }, cpuDelayMs);
  };

  const pickRandomWrong = (question) => {
    const wrongs = question.options.filter((o) => o !== question.answer);
    return wrongs[Math.floor(Math.random() * wrongs.length)];
  };

  // ラウンド決着（あなたの仕様どおり：転送＋サドンデス）
  // ・自分だけ正解   => 相手から myBet を減らし、自分に myBet を加算（転送）
  // ・相手だけ正解   => 自分から enemyBet を減らし、相手に enemyBet を加算（転送）
  // ・両方正解       => サドンデス（同一ベットで決着まで）
  // ・両方不正解     => 変化なし
  const resolveRound = (meOK, cpuOK) => {
    // 演出用の浮遊テキストを一旦消しておく
    setFloatMy("");
    setFloatEnemy("");

    if (meOK && !cpuOK) {
      // 自分勝ち：相手→自分へ転送
      const amt = myBet || 0;
      setEnemyLeft((prev) => Math.max(0, prev - amt));
      setMyLeft((prev) => prev + amt);

      // 演出：自分に +、相手に −
      setFloatMy(`+${amt}`);
      setFloatEnemy(`-${amt}`);
      triggerFlash("rgba(56,189,248,0.85)"); // 青系
      setPhase("reveal");
      setSudden(false);
    } else if (!meOK && cpuOK) {
      // 相手勝ち：自分→相手へ転送
      const amt = enemyBet || 0;
      setMyLeft((prev) => Math.max(0, prev - amt));
      setEnemyLeft((prev) => prev + amt);

      // 演出：自分に −、相手に +
      setFloatMy(`-${amt}`);
      setFloatEnemy(`+${amt}`);
      triggerFlash("rgba(244,63,94,0.85)"); // 赤系
      setPhase("reveal");
      setSudden(false);
    } else if (meOK && cpuOK) {
      // 両方正解：サドンデス（引き分けなし）
      setSudden(true);
      setPhase("bet"); // betをトリガにして問題だけ更新（ベット据え置き）
      triggerFlash("rgba(250,204,21,0.6)"); // 黄系 軽く
    } else {
      // 両方不正解：そのまま結果表示
      setPhase("reveal");
      setSudden(false);
    }
  };

  const triggerFlash = (color) => {
    setFlashColor(color || "rgba(255,255,255,0.85)");
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  const nextStep = () => {
    // 終了条件：どちらか0 or 規定ラウンド消化
    const isFinished = myLeft <= 0 || enemyLeft <= 0 || round >= questionCount;
    if (isFinished) {
      // ★ 勝利時のみSE再生
      if (myLeft > enemyLeft) {
        try {
          winSound.current.currentTime = 0;
          winSound.current.play();
        } catch (e) {
          // 自動再生ブロック等は無視
        }
      }
      setPhase("end");
      return;
    }
    // 次ラウンドへ（サドンデスはこの直前で必ず決着済み）
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
    setPhase("bet");
  };

  // 表示用：今ラウンドの可用ベット一覧（自分の残量以下）
  const myValidOptions = PW_OPTIONS.filter((p) => p <= myLeft && p > 0);

  // ====== レイアウト ======
  return (
    <div className="relative min-h-screen w-full mx-auto max-w-5xl px-4 py-6 grid grid-rows-[auto_1fr_auto_1fr_auto] gap-6">
      {/* 画面フラッシュ */}
      <FlashOverlay color={flashColor} show={flash} />

      {/* ヘッダー */}
      <header className="row-start-1 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          ← 戻る
        </button>
        <h1 className="text-xl font-bold">
          バトル（{questionCount}問） Round {round}/{questionCount}
        </h1>
        <div />
      </header>

      {/* 相手 */}
      <section className="row-start-2 flex flex-col items-center gap-2 relative">
        <div className="text-gray-600 text-sm">相手</div>
        <div className="text-lg font-semibold">{enemyItem.name}</div>
        <div className="w-full relative">
          <Gauge pct={enemyPct} />
          <FloatText text={floatEnemy} show={!!floatEnemy} side="enemy" />
        </div>
        <div className="text-sm text-gray-500">残PW: {enemyLeft}</div>
        {(phase !== "bet" || sudden) && enemyBet != null && (
          <div className="text-xs text-gray-400">
            このラウンドの相手ベット: {enemyBet}
            {sudden && "（サドンデス継続中）"}
          </div>
        )}
      </section>

      {/* 中央ゲージ（総合表示） */}
      <section className="row-start-3">
        <div className="text-center text-sm text-gray-600 mb-2">ゲージ</div>
        <Gauge pct={myPct} />
        <div className="mt-1 text-center text-xs text-gray-500">
          あなた {Math.round(myPct)}% / 相手 {Math.round(enemyPct)}%
        </div>
        {sudden && (
          <div className="mt-2 flex items-center justify-center">
            <span className="animate-pulse px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm font-bold">
              サドンデス中！ 勝敗がつくまで同じベットで続行（{suddenCount + 1}問目）
            </span>
          </div>
        )}
      </section>

      {/* 自分 */}
      <section className="row-start-4 flex flex-col items-center gap-2 relative">
        <div className="text-gray-600 text-sm">あなた</div>
        <div className="text-lg font-semibold">{selectedItem.name}</div>
        <div className="w-full relative">
          <Gauge pct={myPct} />
          <FloatText text={floatMy} show={!!floatMy} side="me" />
        </div>
        <div className="text-sm text-gray-500">残PW: {myLeft}</div>
        {(phase !== "bet" || sudden) && myBet != null && (
          <div className="text-xs text-gray-400">
            このラウンドの自分ベット: {myBet}
            {sudden && "（サドンデス継続中）"}
          </div>
        )}
      </section>

      {/* 下部操作エリア：フェーズ別 */}
      <footer className="row-start-5 flex flex-col items-center justify-center gap-4">
        {/* 1) ベット（通常時のみ）。サドンデス中は自動で問題更新 */}
        {phase === "bet" && !sudden && (
          <>
            <div className="text-sm text-gray-600">
              このラウンドで賭けるPWを選んでね
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {myValidOptions.length > 0 ? (
                myValidOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePickBet(p)}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    {p} PW
                  </button>
                ))
              ) : (
                <div className="text-sm text-red-500">
                  賭けられるPWがありません
                </div>
              )}
            </div>
          </>
        )}

        {/* 2) 問題 */}
        {phase === "question" && q && (
          <>
            <div className="text-base font-semibold">
              {sudden ? "【サドンデス】" : null} {q.text}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {q.options.map((opt) => {
                // 自分側の選択状態（押したら固定）
                const isMine = myAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!myAnswer}
                    className={`px-4 py-2 rounded border ${
                      isMine
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* CPUの選択ハイライト（回答後に見える） */}
            <div className="text-xs text-gray-500 mt-2">
              自分が答えると、少し遅れて相手も解答します…
            </div>
            {cpuAnswer && (
              <div className="text-sm mt-2">
                相手の選択：{" "}
                <span
                  className={`px-2 py-0.5 rounded ${
                    cpuCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {cpuAnswer}（{cpuCorrect ? "正解" : "不正解"}）
                </span>
              </div>
            )}
          </>
        )}

        {/* 3) リザルト（このラウンド or サドンデス結果） */}
        {phase === "reveal" && (
          <div className="w-full max-w-xl text-center">
            <div className="mb-2 text-sm text-gray-600">
              {sudden ? "サドンデス結果" : "このラウンドの結果"}
            </div>
            <div className="p-3 rounded bg-gray-50 border">
              <div className="mb-1">
                あなた：{toResultText(myCorrect)}（ベット {myBet ?? 0}）
              </div>
              <div className="mb-1">
                相手　：{toResultText(cpuCorrect)}（ベット {enemyBet ?? 0}）
              </div>
              <div className="text-xs text-gray-500">
                勝者は自分のベット分だけ相手のPWを奪い、自分のPWに加算します
              </div>
            </div>
            <button
              onClick={nextStep}
              className="mt-3 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              次へ
            </button>
          </div>
        )}

        {/* 4) 試合終了 */}
        {phase === "end" && (
          <div className="w-full max-w-xl text-center">
            <div className="text-xl font-bold mb-2">試合終了！</div>
            <div className="mb-2">
              あなた {myLeft} PW / 相手 {enemyLeft} PW
            </div>
            <div className="mb-4 text-lg">
              {myLeft > enemyLeft ? "あなたの勝ち！" : "あなたの負け…"}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={resetMatch}
                className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                もう一度
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                準備画面へ戻る
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

// ユーティリティ
function toResultText(b) {
  return b == null ? "-" : b ? "正解" : "不正解";
}
