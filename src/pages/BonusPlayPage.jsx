// ------------------------------------------------------
// 🎯 BonusPlayPage.jsx（延長3問ボーナス / Doresta EX Final）
// ------------------------------------------------------
// ✅ 構成：3問制 / 各問1DP / 正解数に応じてDP加算
// ✅ 終了後：Firestore保存＋結果演出＋ホーム遷移
// ✅ ナビキャラ：ドレミノ吹き出しで誘導
// ------------------------------------------------------

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "@/fbkit/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useTheme } from "@/context/ThemeContext";

import NaviBubble from "@/components/NaviBubble";
import NoteBurstGold from "@/components/effects/NoteBurstGold";
import NoteTrackBattle from "@/components/battle/NoteTrackBattle";

// 🎲 簡易問題生成（算数Ver）
function generateQuestion() {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const a = 1 + Math.floor(Math.random() * 9);
  const b = 1 + Math.floor(Math.random() * 9);
  const calc = (x, y, o) =>
    o === "+" ? x + y : o === "-" ? x - y : x * y;
  const answer = calc(a, b, op);
  const choices = new Set([answer]);
  while (choices.size < 4) choices.add(answer + (Math.floor(Math.random() * 6) - 3));
  return { text: `${a} ${op} ${b} = ?`, answer, choices: Array.from(choices).sort(() => Math.random() - 0.5) };
}

export default function BonusPlayPage() {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const auth = getAuth();
  const user = auth.currentUser;

  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [q, setQ] = useState(generateQuestion());
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // ✅ 回答処理
  const answer = (choice) => {
    if (locked || finished) return;
    setLocked(true);
    const correct = choice === q.answer;
    if (correct) setCorrectCount((v) => v + 1);
    setProgress((v) => v + 1);

    setTimeout(() => {
      if (progress + 1 >= 3) {
        setFinished(true);
      } else {
        setQ(generateQuestion());
        setRound((r) => r + 1);
        setLocked(false);
      }
    }, 400);
  };

  // ✅ Firestore保存
  const saveBonusResult = async (dpGain) => {
    if (!user?.uid || saving) return;
    setSaving(true);

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const stats = data.stats || {};

      const newDP = Number(stats.doremiPoints ?? 0) + dpGain;
      const newNotes = Number(stats.battleNotes ?? 0) + 1;

      await setDoc(
        ref,
        {
          stats: { ...stats, doremiPoints: newDP, battleNotes: newNotes },
          lastBonusAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("BonusSave Error:", err);
    }

    setSaving(false);
  };

  // ✅ 終了後処理
  useEffect(() => {
    if (finished) {
      const dpGain = correctCount; // 各問1DP
      saveBonusResult(dpGain);

      // 🎵 成功演出
      if (correctCount > 0) {
        const path = `/sounds/${themeName || "normal"}/battle_win.mp3`;
        const se = new Audio(path);
        se.volume = 0.8;
        se.play().catch(() => {});
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 2200);
      }

      setTimeout(() => {
        navigate("/battle/result", { state: { dpGain, correctCount } });
      }, 2500);
    }
  }, [finished]);

  // ✅ UI構成
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-10 px-4 overflow-hidden"
      style={{ background: theme.background, color: theme.textColor }}
    >
      {/* 🌟 波紋＆音符 */}
      {showRipple && (
        <>
          <div
            className="absolute top-1/2 left-1/2 w-[220px] h-[220px] rounded-full pointer-events-none z-[900]"
            style={{
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.1) 70%)",
              animation: "ripple 2s ease-out forwards",
              boxShadow:
                "0 0 30px 10px rgba(255, 215, 0, 0.4), 0 0 80px 20px rgba(255, 215, 0, 0.3)",
            }}
          />
          <NoteBurstGold count={5} mode="gold" />
        </>
      )}

      <style>{`
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.9; }
          50% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
      `}</style>

      {/* ナビキャラ */}
      <div className="mb-4">
        <NaviBubble
          message={
            !finished
              ? "さあ、ボーナスラウンドへ！"
              : "がんばったね！結果をまとめてるよ🎵"
          }
          subMessage={
            !finished
              ? "3問のボーナス問題で、さらにDPをゲットしよう！"
              : ""
          }
        />
      </div>

      {/* タイトル */}
      <motion.h1
        className="text-2xl font-bold mb-4 drop-shadow"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🎁 ボーナス問題（3問チャレンジ）
      </motion.h1>

      {/* ゲージ */}
      <NoteTrackBattle progress={progress} victoryAt={3} />

      {/* 問題 */}
      {!finished && (
        <motion.div
          className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 mt-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-gray-600 mb-1">第 {round} 問 / 全3問</div>
          <div className="text-3xl font-extrabold text-gray-800 text-center my-4 select-none">
            {q.text}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((c, i) => (
              <button
                key={i}
                disabled={locked}
                onClick={() => answer(c)}
                className={`px-4 py-3 rounded-xl font-bold shadow ${
                  locked ? "opacity-60" : "hover:scale-105"
                }`}
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
      )}

      {/* 結果表示 */}
      <AnimatePresence>
        {finished && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 text-center shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-3xl mb-3">🎉 ボーナス結果！</div>
              <div className="text-lg text-gray-700 mb-4">
                {correctCount}問正解！＋{correctCount} DP 獲得！
              </div>
              <button
                onClick={() =>
                  navigate("/battle/result", { state: { dpGain: correctCount } })
                }
                className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl shadow hover:opacity-90"
              >
                ✅ 結果へ進む
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
