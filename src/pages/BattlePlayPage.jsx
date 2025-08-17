// src/pages/BattlePlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";

const QUESTIONS = [
  { text: "カブトムシの幼虫がよく食べるものは？", options: ["木の葉", "腐葉土", "果物"], answer: "腐葉土" },
  { text: "セミが地中で過ごす年数は？", options: ["1年", "3〜7年", "10年"], answer: "3〜7年" },
];
const PW_OPTIONS = [50, 100, 200, 300];

export default function BattlePlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    enemy,
    selectedItem,
    questionCount = 1,
    initialEnemyPw = 400,
    initialMyPw = 600,
  } = state || {};

  // ===== PW =====
  const [myPw, setMyPw] = useState(initialMyPw);
  const [enemyPw, setEnemyPw] = useState(initialEnemyPw);

  // ===== ラウンド/フェーズ =====
  // betEnemy → betMe → question → enemyAnswered → resolve → (next/result)
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("betEnemy");

  // ベット/問題/回答
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

  // 敵が先にベット（自動／UIは敵側に表示）
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

  // 自分のベット → 問題セット
  const handleMyBet = (bet) => {
    setMyBet(bet);
    setQuestion(QUESTIONS[(round - 1) % QUESTIONS.length]);
    setPhase("question");
  };

  // 自分回答 → 少し待って敵回答 → さらに間をおいて結果
  const handleMyAnswer = (opt) => {
    if (!question) return;
    setMyAnswer(opt);
    // 1) 少し待って敵回答
    setTimeout(() => {
      const cpuIsCorrect = cpuCorrect();
      const cpuOpt = cpuIsCorrect ? question.answer : question.options.find((o) => o !== question.answer);
      setEnemyAnswer(cpuOpt);
      setPhase("enemyAnswered");
      // 2) さらに間をおいて結果計算へ
      setTimeout(() => setPhase("resolve"), 650);
    }, 700);
  };

  // 結果（ダメージ反映）→ 次へ
  useEffect(() => {
    if (phase !== "resolve" || !question) return;

    const meCorrect = myAnswer === question.answer;
    const enCorrect = enemyAnswer === question.answer;

    if (meCorrect && myBet) setEnemyPw((pw) => Math.max(0, pw - myBet));
    if (enCorrect && enemyBet) setMyPw((pw) => Math.max(0, pw - enemyBet));

    const line = [
      meCorrect ? `✅ 自分正解 (-相手 ${myBet})` : "❌ 自分不正解",
      enCorrect ? `✅ 相手正解 (-自分 ${enemyBet})` : "❌ 相手不正解",
    ].join(" / ");
    setLog((p) => [...p, line]);

    const id = setTimeout(() => {
      const nextRound = round + 1;
      if (nextRound > questionCount || myPw === 0 || enemyPw === 0) {
        navigate("/battle/result", { state: { myPw, enemyPw } });
        return;
      }
      setRound(nextRound);
    }, 700);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ===== 中央ゲージ（素のCSS） =====
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

  // 敵側 選択肢ボタン（表示のみ／敵回答後は選択肢をハイライト）
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
      {/* === 上：相手 === */}
      <section className="flex-1 flex flex-col items-center justify-start border-b bg-gray-50 p-3">
        <h2 className="font-bold">相手</h2>
        <div className="mt-2"><ItemCard item={enemyItem} size="md" withFx /></div>

        {/* 敵 ベットUI（自動決定・表示のみ） */}
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

        {/* 敵の選択肢はカードの直下に配置 */}
        {(phase === "question" || phase === "enemyAnswered" || phase === "resolve") && <EnemyChoices />}
      </section>

      {/* === 中央ゲージ === */}
      <Gauge />

      {/* === 下：自分 === */}
      <section className="flex-1 flex flex-col items-center justify-start bg-gray-50 p-3">
        <h2 className="font-bold">自分</h2>
        <div className="mt-2">
          {selectedItem ? (
            <ItemCard item={selectedItem} size="md" withFx />
          ) : (
            <div className="px-3 py-2 rounded bg-gray-200">アイテム未選択</div>
          )}
        </div>

        {/* 自分のベット */}
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

        {/* 自分の選択肢 */}
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

      {/* ログ（デバッグ） */}
      <div className="p-2 bg-gray-900 text-white text-xs">
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
