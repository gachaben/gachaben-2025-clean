// ------------------------------------------------------
// ⚔️ BattleChallengePage.jsx（Doresta EX Final）
// ------------------------------------------------------
// ✅ 対応構成：7問制 / DP報酬 / ボーナス分岐 / ナビ連動
// ✅ 長期運用対応：AdExtendModal / AdPerfectModal / BonusPlayPage 分離
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "@/fbkit/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTheme } from "@/context/ThemeContext";

import NoteTrackBattle from "@/components/battle/NoteTrackBattle";
import NoteBurstGold from "@/components/effects/NoteBurstGold";
import AdExtendModal from "@/components/modals/AdExtendModal";
import AdPerfectModal from "@/components/modals/AdPerfectModal";
import NaviBubble from "@/components/NaviBubble";

// 🎲 簡易問題生成（算数Ver）
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
  while (choices.size < 4)
    choices.add(answer + (Math.floor(Math.random() * 6) - 3));
  return {
    text: `${a} ${op} ${b} = ?`,
    answer,
    choices: Array.from(choices).sort(() => Math.random() - 0.5),
  };
}

export default function BattleChallengePage() {
  const navigate = useNavigate();
  const { theme, themeName } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;

  const [round, setRound] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [q, setQ] = useState(generateQuestion());
  const [history, setHistory] = useState([]); // ← 追加：['correct' | 'wrong'] を積む
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState(null);
  const [showRipple, setShowRipple] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdExtend, setShowAdExtend] = useState(false);
  const [showAdPerfect, setShowAdPerfect] = useState(false);

  // ✅ 回答処理
  const answer = (choice) => {
    if (locked || result) return;
    setLocked(true);

    const correct = choice === q.answer;
    if (correct) setCorrectCount((v) => v + 1);

    // ✅ 結果を履歴に追加（ここが重要）
    setHistory((prev) => [...prev, correct ? "correct" : "wrong"]);

    setProgress((v) => v + 1);

    setTimeout(() => {
      if (progress + 1 >= 7) {
        setResult("finished");
      } else {
        setQ(generateQuestion());
        setRound((r) => r + 1);
        setLocked(false);
      }
    }, 400);
  };

  // ✅ DP計算ロジック
  const calcBaseDP = (count) => {
    let dp = count; // 基本DP（1問=1DP）
    if (count === 4) dp += 1;
    if (count === 5) dp += 2;
    if (count === 6) dp += 3;
    if (count === 7) dp += 5;
    return dp;
  };

  // ✅ Firestore 保存処理
  const saveBattleResult = async (dpGain, premiumGain = 0) => {
    if (!user?.uid || saving) return;
    setSaving(true);

    try {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const stats = data.stats || {};

      const newDP = Number(stats.doremiPoints ?? 0) + dpGain;
      const newNotes = Number(stats.battleNotes ?? 0) + 1;
      const premium = Number(data.premiumTickets ?? 0) + premiumGain;

      await setDoc(
        ref,
        {
          premiumTickets: premium,
          stats: { ...stats, doremiPoints: newDP, battleNotes: newNotes },
          lastBattleAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Save Error:", e);
    }

    setSaving(false);
  };

  // ✅ バトル終了後の処理
 useEffect(() => {
    if (result !== "finished") return;

    let isHandled = false; // ✅ 二重実行防止
 
    const handleFinish = async () => {
      if (isHandled) return;
      isHandled = true;
 
      const dpGain = calcBaseDP(correctCount);
 
      // 🎵 勝利サウンド（1回のみ）
      if (correctCount >= 4) {
        try {
          const path = `/sounds/${themeName || "normal"}/battle_win.mp3`;
          const se = new Audio(path);
          se.volume = 0.8;
          await se.play();
          // ⏳ 2秒後にフェードアウト＆停止
          setTimeout(() => se.pause(), 2000);
        } catch (e) {
          console.warn("Sound play failed:", e);
        }
 
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 2200);
      }
 
      // 🌟 分岐ロジック（非同期で確実に遷移）
      const dpPromise = saveBattleResult(dpGain, correctCount === 7 ? 1 : 0);
      await dpPromise;
 
     if (correctCount <= 3) {
       navigate("/battle/result", { state: { dpGain, correctCount } });
      } else if (correctCount >= 4 && correctCount <= 6) {
        setShowAdExtend(true);
      } else if (correctCount === 7) {
        setShowAdPerfect(true);
     }
     };
 
    handleFinish();
     // cleanup: 万一result再変更でも1回のみ実行
   return () => {
      isHandled = true;
    };
    }, [result]);

  // ✅ UI構成
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-10 px-4 overflow-hidden"
      style={{ background: theme.background, color: theme.textColor }}
    >
      {/* 🌟 勝利波紋 */}
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
                "0 0 30px 10px rgba(255, 215, 0, 0.4), 0 0 80px 20px rgba(255, 215, 0, 0.3)",
              filter: "blur(1px)",
            }}
          />
          <NoteBurstGold count={7} mode="gold" />
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
      <NaviBubble
        message={
          result ? "結果をまとめています..." : `第${round}問！ がんばって！`
        }
      />

      {/* タイトル */}
      <motion.h1
        className="text-2xl font-bold mb-4 drop-shadow"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⚔️ バトル（7問制）
      </motion.h1>

      {/* スコア */}
      <NoteTrackBattle history={history} total={7} />

      {/* 問題パネル */}
      {!result && (
        <motion.div
          className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg p-5 mt-6"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-gray-600 mb-1">
            第 {round} 問 / 全7問
          </div>
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

      {/* モーダル分岐 */}
      <AnimatePresence>
         {showAdExtend && (
          <AdExtendModal
           open={showAdExtend}
            onClose={() => setShowAdExtend(false)}
           onConfirm={() => {
              setShowAdExtend(false);
              navigate("/bonus/play");
            }}
          />
        )}

        {showAdPerfect && (
          <AdPerfectModal
            open={showAdPerfect}
            onClose={() => setShowAdPerfect(false)}
            onConfirm={() => {
              setShowAdPerfect(false);
              navigate("/bonus/special");
            }}
          />
       )}
      </AnimatePresence>
    </div>
  );
}
