// ------------------------------------------------------
// ⚔️ BattleChallengePage.jsx（勝利BGM＋黄金波紋演出＋テーマ連動）
// ------------------------------------------------------
// ✅ 仕様 v1.7b 対応：7問制 / 4問先取 / DP + battleNotes + premiumTickets
// ✅ 勝利時：/sounds/{themeName}/battle_win.mp3 再生 ＋ 黄金波紋演出
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import NoteTrackBattle from "@/components/battle/NoteTrackBattle";
import NoteBurstGold from "@/components/effects/NoteBurstGold";
import { db } from "@/fbkit/app";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔢 仮問題ジェネレータ
function generateQuestion() {
  const ops = ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 1 + Math.floor(Math.random() * 9);
  let b = 1 + Math.floor(Math.random() * 9);
  if (op === "÷") {
    const prod = a * b;
    [a, b] = [prod, a];
  }

  const calc = (x, y, o) =>
    o === "+"
      ? x + y
      : o === "-"
      ? x - y
      : o === "×"
      ? x * y
      : Math.floor(x / y);

  const answer = calc(a, b, op);
  const choices = new Set([answer]);
  while (choices.size < 4) {
    const delta = Math.floor(Math.random() * 7) - 3;
    const cand = answer + (delta === 0 ? 4 : delta);
    choices.add(cand);
  }
  const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
  return { text: `${a} ${op} ${b} = ?`, answer, choices: shuffled };
}

export default function BattleChallengePage() {
  const navigate = useNavigate();
  const { theme, themeName } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;

  const [round, setRound] = useState(1);
  const [myScore, setMyScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [progress, setProgress] = useState(0);
  const [q, setQ] = useState(generateQuestion());
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [showRipple, setShowRipple] = useState(false);
  const [saving, setSaving] = useState(false);

  // 🪙 バトルチケット消費
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const tickets = Number(data?.tickets ?? 0);
          if (tickets > 0) await updateDoc(ref, { tickets: tickets - 1 });
        }
      } catch {}
    })();
  }, [user]);

  // ✅ 回答処理
  const answer = (choice) => {
    if (locked || result) return;
    setLocked(true);

    const correct = choice === q.answer;
    const nextMy = correct ? myScore + 1 : myScore;
    const nextCpu = correct ? cpuScore : cpuScore + 1;
    const nextProgress = Math.min(progress + 1, 7);

    setTimeout(() => {
      setMyScore(nextMy);
      setCpuScore(nextCpu);
      setProgress(nextProgress);

      const isWin = nextMy >= 4 || (nextProgress >= 7 && nextMy > nextCpu);
      const isLose =
        nextCpu >= 4 ||
        (nextProgress >= 7 && nextCpu >= nextMy && nextCpu !== nextMy);

      if (isWin || isLose) {
        if (isWin) {
          // 🎧 勝利サウンド（テーマ連動）
          const path = `/sounds/${themeName || "normal"}/battle_win.mp3`;
          const se = new Audio(path);
          se.volume = 0.8;
          se.play().catch(() => {});

          // 🌟 黄金波紋＋金色音符演出
          setShowRipple(true);
          setTimeout(() => setShowRipple(false), 2200);
        }
        setResult(isWin ? "win" : "lose");
      } else {
        setQ(generateQuestion());
        setRound((r) => r + 1);
        setLocked(false);
      }
    }, 400);
  };

  // ✅ Firestore 保存処理
  const finishAndSave = async () => {
    if (!user?.uid || !result || saving) return navigate("/home");
    setSaving(true);

    const ref = doc(db, "users", user.uid);
    try {
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const stats = data.stats || {};
      const dp = Number(stats.doremiPoints ?? 0);
      const notes = Number(stats.battleNotes ?? 0);
      const premium = Number(data.premiumTickets ?? 0);
      const dpGain = result === "win" ? 10 : 5;

      let newNotes = notes + 1;
      let premiumGain = 0;
      if (newNotes >= 7) {
        premiumGain = 1;
        newNotes = 0;
      }

      await setDoc(
        ref,
        {
          premiumTickets: premium + premiumGain,
          stats: { ...stats, doremiPoints: dp + dpGain, battleNotes: newNotes },
          lastBattleAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {}
    setSaving(false);
    navigate("/home");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-10 px-4 overflow-hidden"
      style={{ background: theme.background, color: theme.textColor }}
    >
      {/* 🌟 黄金波紋＋金色音符（勝利演出） */}
      {showRipple && (
        <>
          {/* 黄金波紋 */}
          <div
            className="absolute top-1/2 left-1/2 w-[240px] h-[240px] rounded-full pointer-events-none z-[900]"
            style={{
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.1) 70%)",
              animation: "ripple 2s ease-out forwards",
              boxShadow:
                "0 0 30px 10px rgba(255, 215, 0, 0.4), 0 0 80px 20px rgba(255, 215, 0, 0.3)",
              filter: "blur(1px)",
            }}
          />

          {/* 金色音符バースト */}
          <NoteBurstGold count={7} mode="gold" />
        </>
      )}

      <style>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.8);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
      `}</style>

      {/* タイトル */}
      <motion.h1
        className="text-2xl font-bold drop-shadow mb-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⚔️ バトル（7問制 / 4問先取）
      </motion.h1>

      {/* スコア＆音符ゲージ */}
      <div className="flex items-center gap-6 mb-4">
        <div className="px-3 py-2 bg-white/70 rounded-xl shadow">
          あなた <span className="font-bold text-pink-600">{myScore}</span>
        </div>
        <NoteTrackBattle progress={progress} victoryAt={4} />
        <div className="px-3 py-2 bg-white/70 rounded-xl shadow">
          CPU <span className="font-bold text-blue-600">{cpuScore}</span>
        </div>
      </div>

      {/* 問題パネル */}
      <motion.div
        className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 mb-6"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-sm text-gray-600 mb-1">第 {round} 問 / 全7問</div>
        <div className="text-3xl font-extrabold text-gray-800 text-center my-4 select-none">
          {q.text}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((c, i) => (
            <button
              key={i}
              disabled={locked || !!result}
              onClick={() => answer(c)}
              className={`px-4 py-3 rounded-xl font-bold shadow transition ${
                locked ? "opacity-60" : "hover:scale-105"
              } ${result ? "opacity-60" : ""}`}
              style={{
                background: i % 2 === 0 ? theme.accent : "#60a5fa",
                color: "#fff",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </motion.div>

      {/* 結果モーダル */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-3xl mb-2">
                {result === "win" ? "🏆 勝利！" : "💧 敗北…"}
              </div>
              <div className="mb-4 text-gray-700">
                {result === "win"
                  ? "＋10 DP を獲得しました。"
                  : "＋5 DP が努力として記録されました。"}
                <br />
                バトル音符が 1 増加します（7音でプレミアムガチャ券 🎁）
              </div>
              <button
                onClick={finishAndSave}
                className="mt-2 px-6 py-3 rounded-xl font-bold text-white shadow"
                style={{ background: theme.accent }}
              >
                ✅ ホームへ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
