// src/pages/BattlePlayPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import useBattleFinish from "../hooks/useBattleFinish";
import { ensureSignedIn } from "@/fbkit";
import { recordMistake } from "../lib/recordMistakes";

// ===== 繧ｵ繝ｳ繝励Ν蝠城｡・=====
const QUESTIONS = [
  { text: "繧ｫ繝悶ヨ繝繧ｷ縺ｮ蟷ｼ陌ｫ縺後ｈ縺城｣溘∋繧九ｂ縺ｮ縺ｯ・・, options: ["譛ｨ縺ｮ闡・, "閻占痩蝨・, "譫懃黄"], answer: "閻占痩蝨・ },
  { text: "繧ｻ繝溘′蝨ｰ荳ｭ縺ｧ驕弱＃縺吝ｹｴ謨ｰ縺ｯ・・, options: ["1蟷ｴ", "3縲・蟷ｴ", "10蟷ｴ"], answer: "3縲・蟷ｴ" },
];

// ===== 縺九￠繧峨ｌ繧輝W蛟呵｣・=====
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

  // ===== 繝舌ヨ繝ｫ髢句ｧ区凾蛻ｻ繝ｻ莠碁㍾邨ゆｺ・ぎ繝ｼ繝・=====
  const startedAtRef = useRef(Date.now());
  const finishedOnceRef = useRef(false);

  // ===== PW =====
  const [myPw, setMyPw] = useState(initialMyPw);
  const [enemyPw, setEnemyPw] = useState(initialEnemyPw);

  // ===== 騾ｲ陦檎ｮ｡逅・=====
  // betEnemy 竊・betMe 竊・question 竊・enemyAnswered 竊・resolve 竊・(next/result)
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("betEnemy");

  const [enemyBet, setEnemyBet] = useState(null);
  const [myBet, setMyBet] = useState(null);
  const [question, setQuestion] = useState(null);
  const [myAnswer, setMyAnswer] = useState(null);
  const [enemyAnswer, setEnemyAnswer] = useState(null);

  // 繝ｩ繧ｦ繝ｳ繝峨Ο繧ｰ・育ｵ先棡繝壹・繧ｸ菫晏ｭ倡畑・・
  const [roundLogs, setRoundLogs] = useState([]);
  // 逕ｻ髱｢陦ｨ遉ｺ逕ｨ縺ｮ邁｡譏薙Ο繧ｰ
  const [log, setLog] = useState([]);

  // ===== ItemCard 逕ｨ縺ｫ謨ｵ繝・・繧ｿ謨ｴ蠖｢ =====
  const enemyItem = useMemo(() => {
    if (enemy && (enemy.seriesId || enemy.imageName || enemy.itemId)) return enemy;
    if (enemy && enemy.item) return enemy.item;
    if (selectedItem) {
      return {
        ...selectedItem,
        itemId: (selectedItem.itemId ?? selectedItem.id ?? "cpu") + "-cpu",
        name: (selectedItem.name ? `${selectedItem.name}・・PU・荏 : "CPU"),
      };
    }
    return { itemId: "cpu-001", seriesId: "kontyu", stage: 3, imageName: "kabuto", name: "CPU", rank: "S" };
  }, [enemy, selectedItem]);

  // ===== 邯ｱ蠑輔″繧ｲ繝ｼ繧ｸ =====
  const total = Math.max(1, myPw + enemyPw);
  const enemyPct = (enemyPw / total) * 100;
  const myPct = 100 - enemyPct;

  // ===== CPU繝ｭ繧ｸ繝・け =====
  const pickCpuBet = (remain) => {
    const target = Math.max(50, Math.floor((remain * 0.2) / 50) * 50);
    const affordable = PW_OPTIONS.filter((v) => v <= remain);
    if (affordable.length === 0) return 50;
    let best = affordable[0];
    for (const v of affordable) if (Math.abs(v - target) <= Math.abs(best - target)) best = v;
    return best;
  };
  const cpuCorrect = () => Math.random() < 0.6;

  // ===== 繝ｩ繧ｦ繝ｳ繝蛾幕蟋区凾縺ｮ繝ｪ繧ｻ繝・ヨ =====
  useEffect(() => {
    setEnemyBet(null);
    setMyBet(null);
    setQuestion(null);
    setMyAnswer(null);
    setEnemyAnswer(null);
    setPhase("betEnemy");
  }, [round]);

  // ===== 謨ｵ縺悟・縺ｫ繝吶ャ繝・=====
  useEffect(() => {
    if (phase !== "betEnemy") return;
    const id = setTimeout(() => {
      const bet = pickCpuBet(enemyPw);
      setEnemyBet(bet);
      setLog((p) => [...p, `逶ｸ謇九′ ${bet} PW 繧偵・繝・ヨ`]);
      setPhase("betMe");
    }, 700);
    return () => clearTimeout(id);
  }, [phase, enemyPw]);

  // ===== 閾ｪ蛻・・繝吶ャ繝・=====
  const handleMyBet = (bet) => {
    setMyBet(bet);
    setQuestion(QUESTIONS[(round - 1) % QUESTIONS.length]);
    setPhase("question");
  };

  // ===== 閾ｪ蛻・屓遲・竊・CPU蝗樒ｭ・竊・resolve =====
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

  // ===== 豎ｺ逹蜃ｦ逅・& 谺｡繝ｩ繧ｦ繝ｳ繝会ｼ冗ｵゆｺ・愛螳・=====
  useEffect(() => {
    if (phase !== "resolve" || !question) return;

    const meCorrect = myAnswer === question.answer;
    const enCorrect = enemyAnswer === question.answer;

    const nextEnemyPw = Math.max(0, enemyPw - (meCorrect && myBet ? myBet : 0));
    const nextMyPw    = Math.max(0, myPw    - (enCorrect && enemyBet ? enemyBet : 0));

    if (meCorrect && myBet) setEnemyPw(nextEnemyPw);
    if (enCorrect && enemyBet) setMyPw(nextMyPw);

    const line = [
      meCorrect ? `笨・閾ｪ蛻・ｭ｣隗｣ (-逶ｸ謇・${myBet})` : "笶・閾ｪ蛻・ｸ肴ｭ｣隗｣",
      enCorrect ? `笨・逶ｸ謇区ｭ｣隗｣ (-閾ｪ蛻・${enemyBet})` : "笶・逶ｸ謇倶ｸ肴ｭ｣隗｣",
    ].join(" / ");
    setLog((p) => [...p, line]);

    // 繝ｩ繧ｦ繝ｳ繝峨Ο繧ｰ・郁ｩｳ邏ｰ・・
    setRoundLogs((prev) => [
      ...prev,
      {
        round,
        enemyBet,
        myBet,
        myAnswer,
        enemyAnswer,
        correctAnswer: question.answer,
        meCorrect,
        enCorrect,
        myPwAfter: nextMyPw,
        enemyPwAfter: nextEnemyPw,
        qText: question.text,
        qOptions: question.options,
      },
    ]);

    // 荳肴ｭ｣隗｣縺ｯ mistakes 縺ｫ菫晏ｭ・
    (async () => {
      if (!meCorrect && question && myAnswer) {
        const user = await ensureSignedIn();
        await recordMistake({
          uid: user?.uid,
          question,
          picked: myAnswer,
          source: "battle",
        });
        // eslint-disable-next-line no-console
        console.log("[mistake] recorded:", { uid: user?.uid, q: question.text, picked: myAnswer });
      }
    })();

    const id = setTimeout(() => {
      const nextRound = round + 1;
      const isFinished = nextRound > questionCount || nextMyPw === 0 || nextEnemyPw === 0;

      if (isFinished) {
        if (!finishedOnceRef.current) {
          finishedOnceRef.current = true; // 笘・ｺ碁㍾邨ゆｺ・ぎ繝ｼ繝・
          // 蜍晄風
          let winner = "draw";
          if (nextMyPw === 0 && nextEnemyPw === 0) winner = "draw";
          else if (nextEnemyPw === 0 || nextMyPw > nextEnemyPw) winner = "you";
          else if (nextMyPw === 0 || nextEnemyPw > nextMyPw) winner = "enemy";

          // 菫晏ｭ倥→驕ｷ遘ｻ縺ｯ hook 蛛ｴ縺ｫ蟋碑ｭｲ
          onBattleFinish({
            start: startedAtRef.current,
            end: Date.now(),
            myFinalLeft: nextMyPw,
            enemyFinalLeft: nextEnemyPw,
            roundsPlayed: round,          // 螳滄圀縺ｫ繝励Ξ繧､縺励◆蝗樊焚
            questionCount,                // 莠亥ｮ壼撫鬘梧焚
            winner,                       // "you" | "enemy" | "draw"
            selectedItem,
            enemyItem,
            userId,
            myPwStart: initialMyPw,
            myPwEnd: nextMyPw,
            enemyPwStart: initialEnemyPw,
            enemyPwEnd: nextEnemyPw,
            log: roundLogs,               // 蜷・Λ繧ｦ繝ｳ繝峨・隧ｳ邏ｰ
          });
        }
        return;
      }
      setRound(nextRound);
    }, 700);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]); // 萓晏ｭ倥・ phase 縺ｫ髯仙ｮ夲ｼ井ｻ悶・蜀・Κ縺ｧ蜿ら・・・

  // ===== 荳ｭ螟ｮ繧ｲ繝ｼ繧ｸ =====
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
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>PW繧ｲ繝ｼ繧ｸ</div>
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
          <span>逶ｸ謇・{Math.round(enemyPct)}%</span>
          <span>閾ｪ蛻・{Math.round(myPct)}%</span>
        </div>
      </div>
    </section>
  );

  // ===== 逶ｸ謇九・驕ｸ謚櫁い・郁｡ｨ遉ｺ蟆ら畑・・=====
  const EnemyChoices = () => {
    if (!question) return null;
    return (
      <div style={{ width: "100%", maxWidth: 720, padding: "0 12px", marginTop: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>逶ｸ謇九・驕ｸ謚櫁い</div>
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
      {/* 荳奇ｼ夂嶌謇・*/}
      <section className="flex-1 flex flex-col items-center justify-start border-b bg-gray-50 p-3">
        <h2 className="font-bold">逶ｸ謇・/h2>
        <div className="mt-2"><ItemCard item={enemyItem} size="md" withFx /></div>

        {/* 謨ｵ 繝吶ャ繝・I・郁｡ｨ遉ｺ縺ｮ縺ｿ・・*/}
        <div className="mt-3" style={{ width: "100%", maxWidth: 720, padding: "0 12px" }}>
          <div className="text-sm font-semibold mb-1">
            縺九￠繧輝W・・ound {round}/{questionCount})
            {phase === "betEnemy" && <span className="ml-2 text-xs text-gray-500">窶ｦ諤晁・ｸｭ</span>}
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

      {/* 荳ｭ螟ｮ繧ｲ繝ｼ繧ｸ */}
      <Gauge />

      {/* 荳具ｼ夊・蛻・*/}
      <section className="flex-1 flex flex-col items-center justify-start bg-gray-50 p-3">
        <h2 className="font-bold">閾ｪ蛻・/h2>
        <div className="mt-2">
          {selectedItem ? <ItemCard item={selectedItem} size="md" withFx /> : <div className="px-3 py-2 rounded bg-gray-200">繧｢繧､繝・Β譛ｪ驕ｸ謚・/div>}
        </div>

        {phase === "betMe" && (
          <div className="mt-3 w-full max-w-sm">
            <div className="text-sm font-semibold mb-1">縺九￠繧輝W繧帝∈縺ｶ・・ound {round}/{questionCount})</div>
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
            <div className="mt-2 text-xs text-gray-500">繝吶ャ繝茨ｼ夂嶌謇・{enemyBet ?? "-"} / 閾ｪ蛻・{myBet ?? "-"}</div>
          </div>
        )}
      </section>

      {/* 繝ｭ繧ｰ・井ｸ矩Κ・・*/}
      <div className="p-2 bg-gray-900 text-white text-xs">
        {log.map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}
