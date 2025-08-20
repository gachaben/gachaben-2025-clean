// src/pages/BattlePlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import useBattleFinish from "../hooks/useBattleFinish";
import { ensureSignedIn } from "../firebase";
import { recordMistake } from "../lib/recordMistakes";

const QUESTIONS = [
  { text: "カブトムシの幼虫がよく食べるものは？", options: ["木の葉", "腐葉土", "果物"], answer: "腐葉土" },
  { text: "セミが地中で過ごす年数は？", options: ["1年", "3〜7年", "10年"], answer: "3〜7年" },
];
const PW_OPTIONS = [50, 100, 200, 300];

export default function BattlePlayPage() {
  const { state } = useLocation();
  const { onBattleFinish } = useBattleFinish();

  const {
    enemy,
    selectedItem,
    questionCount = 1,
    initialEnemyPw = 400,
    initialMyPw = 600,
    userId,
  } = state || {};

  // ===== PW =====
  const [myPw, setMyPw] = useState(initialMyPw);
  const [enemyPw, setEnemyPw] = useState(initialEnemyPw);

  // ===== 進行管理 =====
  // betEnemy → betMe → question → enemyAnswered → resolve → (next/result)
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("betEnemy");

  const [enemyBet, setEnemyBet] = useState(null);
  const [myBet, setMyBet] = useState(null);
  const [question, setQuestion] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [enemyAnswer, setEnemyAnswer] = useState(null);

  const [log, setLog] = useState([]);

  // ===== ItemCard 用に敵データ整形 =====
  const enemyItem = useMemo(() => {
    if (enemy && (enemy.seriesId || enemy.imageName || enemy.itemId)) return enemy;
    if (enemy && enemy.item) return enemy.item;
    if (selectedItem) {
      return {
        ...selectedItem,
        itemId: (selectedItem.itemId ?? selectedItem.id ?? "cpu") + "-cpu",
        name: (selectedItem.name ? `${selectedItem.name}（CPU）` : "CPU"),
      };
    }
    return { itemId: "cpu-001", seriesId: "kontyu", stage: 3, imageName: "kabuto", name: "CPU", rank: "S" };
  }, [enemy, selectedItem]);

  // ===== 綱引きゲージ =====
  const total = Math.max(1, myPw + enemyPw);
  const enemyPct = (enemyPw / total) * 100;
  const myPct = 100 - enemyPct;

  // ===== CPUロジック =====
  const pickCpuBet = (remain) => {
    const target = Math.max(50, Math.floor((remain * 0.2) / 50) * 50);
    const affordable = PW_OPTIONS.filter((v) => v <= remain);
    if (affordable.length === 0) return 50;
    let best = affordable[0];
    for (const v of affordable) if (Math.abs(v - target) <= Math.abs(best - target)) best = v;
    return best;
  };
  const cpuCorrect = () => Math.random() < 0.6;

  // ラウンド開始リセット
  useEffect(() => {
    setEnemyBet(null);
    setMyBet(null);
    setQuestion(null);
    setMyAnswer(null);
    setEnemyAnswer(null);
    setPhase("betEnemy");
  }, [round]);

  // 敵が先にベット
  useEffect(() => {
    if (phase !== "betEnemy") return;
    const id = setTimeout(() => {
      const bet = pickCpuBet(enemyPw);
      setEnemyBet(bet);
      setLog((p) => [...p, `相手が ${bet} PW をベット`]);
      setPhase("betMe");
    }, 700);
    return () => clearTimeout(id);
  }, [phase, enemyPw]);

  // 自分のベット
  const handleMyBet = (bet) => {
    setMyBet(bet);
    setQuestion(QUESTIONS[(round - 1) % QUESTIONS.length]);
    setPhase("question");
  };

  // 自分回答
  const handleMyAnswer = (opt) => {
    if (!question) return;
    setMyAnswer(opt);
    setTimeout(() => {
      const cpuIsCorrect = cpuCorrect();
      const cpuOpt = cpuIsCorrect ? question.answer : question.options.find((o) => o !== question.answer);
      setEnemyAnswer(cpuOpt);
      setPhase("enemyAnswered");
      setTimeout(() => setPhase("resolve"), 650);
    }, 700);
  };

  // 結果 → 次へ
  useEffect(() => {
    if (phase !== "resolve" || !question) return;

    const meCorrect = myAnswer === question.answer;
    const enCorrect = enemyAnswer === question.answer;

    const nextEnemyPw = Math.max(0, enemyPw - (meCorrect && myBet ? myBet : 0));
    const nextMyPw    = Math.max(0, myPw    - (enCorrect && enemyBet ? enemyBet : 0));

    if (meCorrect && myBet) setEnemyPw(nextEnemyPw);
    if (enCorrect && enemyBet) setMyPw(nextMyPw);

    const line = [
      meCorrect ? `✅ 自分正解 (-相手 ${myBet})` : "❌ 自分不正解",
      enCorrect ? `✅ 相手正解 (-自分 ${enemyBet})` : "❌ 相手不正解",
    ].join(" / ");
    setLog((p) => [...p, line]);

    // 不正解は mistakes へ保存
    (async () => {
      if (!meCorrect && question && myAnswer) {
        const user = await ensureSignedIn();
        await recordMistake({
          uid: user?.uid,
          question,
          picked: myAnswer,
          source: "battle",
        });
        console.log("[mistake] recorded:", { uid: user?.uid, q: question.text, picked: myAnswer });
      }
    })();

    const id = setTimeout(() => {
      const nextRound = round + 1;
      const isFinished = nextRound > questionCount || nextMyPw === 0 || nextEnemyPw === 0;

      if (isFinished) {
        // 保存は内部で try/catch、結果遷移は常に行う
        onBattleFinish({
          myFinalLeft: nextMyPw,
          enemyFinalLeft: nextEnemyPw,
          roundsPlayed: round,
          selectedItem,
          enemyItem,
          userId,
        });
        return;
      }
      setRound(nextRound);
    }, 700);

    return () => clearTimeout(id);
  }, [phase]);

  // ===== 中央ゲージ =====
  const Gauge = () => (
    <section
      style={{
        padding: "12px 0",
        background: "#f3f4f6",
        borderTop: "1px solid #e5e7eb",
        borderBottom: "1px solid #e5e7eb",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 12px" }}>
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>PWゲージ</div>
        <div
          style={{
            position: "relative",
            height: 20,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #d1d5db",
            background: "#ffffff",
          }}
        >
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${enemyPct}%`, background: "rgba(239,68,68,0.9)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${myPct}%`, background: "rgba(59,130,246,0.9)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.85)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4, color: "#4b5563" }}>
          <span>相手 {Math.round(enemyPct)}%</span>
          <span>自分 {Math.round(myPct)}%</span>
        </div>
      </div>
    </section>
  );

  const EnemyChoices = () => {
    if (!question) return null;
    return (
      <div style={{ width: "100%", maxWidth: 720, padding: "0 12px", marginTop: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>相手の選択肢</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {question.options.map((opt) => {
            const isPicked = enemyAnswer === opt;
            return (
              <button
                key={`enemy-opt-${opt}`}
                disabled
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: `2px solid ${isPicked ? "#ef4444" : "#e5e7eb"}`,
                  background: "#fff",
                  opacity: 0.9,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 上：相手 */}
      <section className="flex-1 flex flex-col items-center justify-start border-b bg-gray-50 p-3">
        <h2 className="font-bold">相手</h2>
        <div className="mt-2"><ItemCard item={enemyItem} size="md" withFx /></div>

        {/* 敵 ベットUI（表示のみ） */}
        <div className="mt-3" style={{ width: "100%", maxWidth: 720, padding: "0 12px" }}>
          <div className="text-sm font-semibold mb-1">
            かけるPW（Round {round}/{questionCount}）
            {phase === "betEnemy" && <span className="ml-2 text-xs text-gray-500">…思考中</span>}
          </div>
          <div className="flex gap-2 flex-wrap opacity-90">
            {PW_OPTIONS.map((pw) => (
              <button
                key={`enemy-${pw}`}
                className="px-3 py-1 rounded border bg-white"
                disabled
                style={{ borderColor: enemyBet === pw ? "#ef4444" : "#e5e7eb", color: enemyBet === pw ? "#b91c1c" : "#111827" }}
              >
                {pw}
              </button>
            ))}
          </div>
        </div>

        {(phase === "question" || phase === "enemyAnswered" || phase === "resolve") && <EnemyChoices />}
      </section>

      {/* 中央ゲージ */}
      <Gauge />

      {/* 下：自分 */}
      <section className="flex-1 flex flex-col items-center justify-start bg-gray-50 p-3">
        <h2 className="font-bold">自分</h2>
        <div className="mt-2">
          {selectedItem ? <ItemCard item={selectedItem} size="md" withFx /> : <div className="px-3 py-2 rounded bg-gray-200">アイテム未選択</div>}
        </div>

        {phase === "betMe" && (
          <div className="mt-3 w-full max-w-sm">
            <div className="text-sm font-semibold mb-1">かけるPWを選ぶ（Round {round}/{questionCount}）</div>
            <div className="flex gap-2 flex-wrap">
              {PW_OPTIONS.map((pw) => (
                <button
                  key={`me-${pw}`}
                  className="px-3 py-2 rounded bg-blue-600 text-white hover:opacity-90 disabled:opacity-40"
                  disabled={pw > myPw}
                  onClick={() => handleMyBet(pw)}
                >
                  {pw}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "question" && question && (
          <div className="mt-4 w-full max-w-[720px]">
            <div className="font-semibold mb-2">{question.text}</div>
            <div className="flex gap-2 flex-wrap">
              {question.options.map((opt) => (
                <button
                  key={`me-opt-${opt}`}
                  className="px-3 py-2 rounded border bg-white hover:bg-blue-50"
                  onClick={() => handleMyAnswer(opt)}
                  disabled={!!myAnswer}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">ベット：相手 {enemyBet} / 自分 {myBet ?? "-"}</div>
          </div>
        )}
      </section>

      {/* ログ */}
      <div className="p-2 bg-gray-900 text-white text-xs">
        {log.map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}
