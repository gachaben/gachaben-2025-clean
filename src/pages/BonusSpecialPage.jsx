// ------------------------------------------------------
// 🌈 BonusSpecialPage.jsx（スペシャル1問ボーナス / Doresta EX Final）
// ------------------------------------------------------
// ✅ 対応：7問全問正解 → 広告 → このページで出題
// ✅ 正解時：+5DP +音符+1、金色波紋＋音演出あり
// ✅ ナビ：ドレミノの特別セリフ付き
// ------------------------------------------------------

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "@/fbkit/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTheme } from "@/context/ThemeContext";

import NaviBubble from "@/components/NaviBubble";
import NoteBurstGold from "@/components/effects/NoteBurstGold";

function generateSpecialQuestion() {
  // 🎯 難易度高め問題
  const ops = ["×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = 2 + Math.floor(Math.random() * 8);
  let b = 2 + Math.floor(Math.random() * 8);

  if (op === "÷") {
    const prod = a * b;
    [a, b] = [prod, a];
  }

  const calc = (x, y, o) => (o === "×" ? x * y : Math.floor(x / y));
  const answer = calc(a, b, op);
  const choices = new Set([answer]);
  while (choices.size < 4) choices.add(answer + (Math.floor(Math.random() * 10) - 5));

  return {
    text: `${a} ${op} ${b} = ?`,
    answer,
    choices: Array.from(choices).sort(() => Math.random() - 0.5),
  };
}

export default function BonusSpecialPage() {
  const { theme, themeName } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [q, setQ] = useState(generateSpecialQuestion());
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  // ✅ 回答処理
  const handleAnswer = (choice) => {
    if (answered) return;
    setAnswered(true);
    const isCorrect = choice === q.answer;
    setCorrect(isCorrect);

    if (isCorrect) {
      // 🎵 正解音
      const path = `/sounds/${themeName || "normal"}/battle_win.mp3`;
      const se = new Audio(path);
      se.volume = 0.8;
      se.play().catch(() => {});

      // 🌟 黄金波紋演出
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 2000);

      // DP加算
      saveSpecialResult(5, 1);
    } else {
      // 不正解でも0.5DP努力報酬にしてもOK（拡張可）
      saveSpecialResult(0, 0);
    }

    setTimeout(() => navigate("/battle/result"), 3000);
  };

  // ✅ Firestore保存
  const saveSpecialResult = async (dpGain, noteGain) => {
    if (!user?.uid || saving) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const stats = data.stats || {};

      const newDP = Number(stats.doremiPoints ?? 0) + dpGain;
      const newNotes = Number(stats.battleNotes ?? 0) + noteGain;
      const premium = Number(data.premiumTickets ?? 0);

      await setDoc(
        ref,
        {
          stats: { ...stats, doremiPoints: newDP, battleNotes: newNotes },
          premiumTickets: premium,
          lastSpecialAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("SaveSpecial Error:", err);
    }
    setSaving(false);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-10 px-4 overflow-hidden"
      style={{ background: theme.background, color: theme.textColor }}
    >
      {/* 🌟 黄金波紋 */}
      {showRipple && (
        <>
          <div
            className="absolute top-1/2 left-1/2 w-[240px] h-[240px] rounded-full pointer-events-none z-[900]"
            style={{
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,215,0,0.1) 70%)",
              animation: "ripple 2s ease-out forwards",
              boxShadow:
                "0 0 40px 15px rgba(255,215,0,0.5), 0 0 100px 30px rgba(255,215,0,0.4)",
              filter: "blur(1px)",
            }}
          />
          <NoteBurstGold count={8} mode="gold" />
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
            !answered
              ? "🔥 激アツ！スペシャルボーナス問題！"
              : correct
              ? "すごい！！キミの音が響いたよ！🎵"
              : "おしい！でも努力の音はちゃんと残ってるよ！"
          }
          subMessage={
            !answered
              ? "正解すれば5DPと音符ボーナスをゲット！"
              : correct
              ? "+5DP ＋ 音符＋1 🎶"
              : "また挑戦してみよう！"
          }
        />
      </div>

      {/* タイトル */}
      <motion.h1
        className="text-2xl font-bold mb-4 drop-shadow"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🌟 スペシャルボーナス問題
      </motion.h1>

      {/* 問題パネル */}
      {!answered && (
        <motion.div
          className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 mt-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-3xl font-extrabold text-gray-800 text-center my-4 select-none">
            {q.text}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {q.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(c)}
                disabled={answered}
                className={`px-4 py-3 rounded-xl font-bold shadow ${
                  answered ? "opacity-60" : "hover:scale-105"
                }`}
                style={{
                  background: i % 2 === 0 ? theme.accent : "#facc15",
                  color: "#fff",
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 結果画面 */}
      <AnimatePresence>
        {answered && (
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
              <div className="text-3xl mb-3">
                {correct ? "🏆 パーフェクトクリア！" : "💧 チャンスはまた来る！"}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                {correct ? "+5 DP ＋ 音符 +1 獲得！" : "努力は次に生きる！"}
              </div>
              <button
                onClick={() => navigate("/battle/result")}
                className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow hover:opacity-90"
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
