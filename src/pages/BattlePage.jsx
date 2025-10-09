// src/pages/BattlePage.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/fbkit";

// ❤️ ハート関連（追加）
import useHeartGate from "@/hooks/useHeartGate";
import AdHeartModal from "@/components/AdHeartModal";
import { useHearts } from "@/context/HeartsContext";

// ==== 手アイコン ====
const HAND_IMG = {
  g: "/images/janken/gu.png",
  c: "/images/janken/choki.png",
  p: "/images/janken/pa.png",
};
const HANDS = ["g", "c", "p"];

function HandImage({ hand, size = 64 }) {
  if (!hand) return null;
  return (
    <img
      src={HAND_IMG[hand]}
      alt={hand}
      width={size}
      height={size}
      className="select-none"
      draggable={false}
    />
  );
}

function HandRow({ selected, disabled = false, onPick }) {
  const clickable = !!onPick && !disabled;
  return (
    <div className="flex items-center justify-center gap-6">
      {HANDS.map((key) => {
        const isPicked = selected === key;
        const isDim = selected && selected !== key;
        return (
          <button
            key={key}
            onClick={clickable ? () => onPick(key) : undefined}
            disabled={!clickable}
            className={[
              "rounded-lg border p-3 w-20 h-20 flex items-center justify-center transition",
              clickable ? "hover:bg-gray-50 active:scale-[0.98]" : "cursor-default",
              isPicked ? "ring-2 ring-blue-500 bg-white" : "",
              isDim ? "opacity-30" : "",
            ].join(" ")}
          >
            <HandImage hand={key} size={48} />
          </button>
        );
      })}
    </div>
  );
}

function judge(user, cpu) {
  if (user === cpu) return "draw";
  if (
    (user === "g" && cpu === "c") ||
    (user === "c" && cpu === "p") ||
    (user === "p" && cpu === "g")
  )
    return "win";
  return "lose";
}

// ==== メイン ====
export default function BattlePage() {
  const { hearts } = useHearts(); // 現在のハート数
  const [phase, setPhase] = useState("ready");
  const [userPick, setUserPick] = useState(null);
  const [cpuPick, setCpuPick] = useState(null);
  const [result, setResult] = useState(null);
  const [questionSource, setQuestionSource] = useState(null); // 'user' or 'cpu'
  const [questionObj, setQuestionObj] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);

  // ==== useHeartGate：ハート消費制御 ====
  const { startWithHeart, adOpen, closeAd, watchAd } = useHeartGate({
    onProceed: async () => {
      setPhase("janken"); // バトル開始
    },
  });

  // ---- Firestoreからユーザーmistakesを1問取得 ----
  const loadUserQuestion = async () => {
    const snap = await getDocs(collection(db, "mistakes"));
    const list = snap.docs.map((d) => d.data());
    if (list.length === 0) {
      return {
        question: "（サンプル）カマキリは何の仲間？",
        choices: ["虫", "魚", "鳥", "草"],
        answer: "虫",
      };
    }
    return list[Math.floor(Math.random() * list.length)];
  };

  // ---- CPU専用問題 ----
  const loadCpuQuestion = () => ({
    question: "【CPUの出題】ハチの足は何本ある？",
    choices: ["2本", "4本", "6本", "8本"],
    answer: "6本",
  });

  // ---- じゃんけん処理 ----
  const handlePick = (hand) => {
    const cpu = HANDS[Math.floor(Math.random() * HANDS.length)];
    setUserPick(hand);
    setCpuPick(cpu);
    setResult(null);
    setPhase("result");

    setTimeout(() => {
      const res = judge(hand, cpu);
      setResult(res);
      if (res === "win") setQuestionSource("user");
      else if (res === "lose") setQuestionSource("cpu");
      else setQuestionSource(null);

      if (res !== "draw") {
        setTimeout(() => setPhase("question"), 1200);
      } else {
        setTimeout(reset, 1200);
      }
    }, 700);
  };

  // ---- 出題フェーズ ----
  useEffect(() => {
    if (phase === "question" && questionSource) {
      if (questionSource === "user") {
        loadUserQuestion().then((q) => {
          setQuestionObj(q);
          // CPUが1秒後に回答
          setTimeout(() => {
            const cpuChoice = q.choices[Math.floor(Math.random() * q.choices.length)];
            setSelectedAnswer(cpuChoice);
            setTimeout(() => handleAutoCpuAnswer(cpuChoice, q.answer), 1000);
          }, 1000);
        });
      } else {
        const q = loadCpuQuestion();
        setQuestionObj(q);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, questionSource]);

  // ---- CPU自動回答 ----
  const handleAutoCpuAnswer = (choice, correctAnswer) => {
    const correct = choice === correctAnswer;
    setAnswerResult(correct ? "CPUは正解！" : "CPUは不正解！");
    setPhase("answer");
    setTimeout(reset, 2000);
  };

  // ---- ユーザー回答 ----
  const handleUserAnswer = (choice) => {
    setSelectedAnswer(choice);
    const correct = choice === questionObj.answer;
    setAnswerResult(correct ? "正解！" : "不正解…");
    setPhase("answer");
    setTimeout(reset, 2000);
  };

  const reset = () => {
    setUserPick(null);
    setCpuPick(null);
    setResult(null);
    setQuestionSource(null);
    setQuestionObj(null);
    setSelectedAnswer(null);
    setAnswerResult(null);
    setPhase("janken");
  };

  // ==== UI ====
  return (
    <div className="p-4 space-y-6 text-center">
      <h1 className="text-lg font-bold">🥊 バトルモード</h1>
      <div className="text-sm text-gray-600">現在のハート：{hearts}</div>

      {/* ---- ハートがあれば開始 ---- */}
      {phase === "ready" && (
        <button
          onClick={startWithHeart}
          className="px-6 py-3 bg-rose-300 hover:bg-rose-400 rounded-lg font-bold shadow transition"
        >
          ▶️ バトル開始（ハート1消費）
        </button>
      )}

      {/* ---- じゃんけん ---- */}
      {phase !== "ready" && (
        <>
          {phase === "janken" && <div className="text-2xl font-bold">じゃんけん！</div>}
          {phase === "result" && <div className="text-2xl font-bold">ポン！</div>}
          {phase === "question" && (
            <div className="text-xl font-semibold text-indigo-600">
              {questionSource === "user" ? "あなたが出題！" : "CPUが出題！"}
            </div>
          )}

          {/* CPU */}
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
                disabled={!!userPick || phase !== "janken"}
                onPick={handlePick}
              />
            </div>
          </section>

          {/* 勝敗 */}
          {phase === "result" && result && (
            <div className="text-xl font-bold mt-2">
              {result === "win" && <span className="text-emerald-600">あなたの勝ち！</span>}
              {result === "lose" && <span className="text-rose-600">CPUの勝ち！</span>}
              {result === "draw" && <span className="text-gray-600">あいこ！</span>}
            </div>
          )}

          {/* 問題 */}
          {phase === "question" && questionObj && (
            <div className="mt-6 p-4 border rounded bg-white w-full max-w-md mx-auto">
              <div className="font-bold mb-3">{questionObj.question}</div>
              <div className="grid grid-cols-2 gap-2">
                {questionObj.choices.map((c, i) => (
                  <button
                    key={i}
                    onClick={questionSource === "cpu" ? () => handleUserAnswer(c) : undefined}
                    disabled={selectedAnswer !== null || questionSource === "user"}
                    className={[
                      "border rounded p-2 transition",
                      selectedAnswer === c
                        ? "bg-yellow-100 border-yellow-400"
                        : questionSource === "user"
                        ? "cursor-default opacity-60"
                        : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 結果 */}
          {phase === "answer" && (
            <div className="text-2xl font-bold mt-4">
              <span
                className={
                  answerResult.includes("正解") ? "text-emerald-600" : "text-rose-600"
                }
              >
                {answerResult}
              </span>
            </div>
          )}
        </>
      )}

      {/* ❤️ ハート広告モーダル */}
      <AdHeartModal open={adOpen} onClose={closeAd} onWatch={watchAd} />
    </div>
  );
}
