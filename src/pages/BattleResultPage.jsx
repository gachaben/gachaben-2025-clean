// ------------------------------------------------------
// 🎵 BattleResultPage.jsx（共通リザルトページ / Doresta EX Final）
// ------------------------------------------------------
// ✅ 機能一覧
//  - 通常 / ボーナス / スペシャル全対応
//  - DP報酬・音符・ストリーク更新
//  - 黄金波紋＋ドレミノナビ演出
//  - Firestore自動加算＆継続ストリーク処理
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "@/fbkit/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useTheme } from "@/context/ThemeContext";
import NaviBubble from "@/components/NaviBubble";
import NoteBurstGold from "@/components/effects/NoteBurstGold";

export default function BattleResultPage() {
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();
  const user = auth.currentUser;

  // 🧾 受け取るデータ（Battle / Bonus / Special 共通）
  const { dpGain = 0, correctCount = 0, fromBonus = false } =
    location.state || {};

  const [saving, setSaving] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [stats, setStats] = useState({
    totalDP: 0,
    streak: 0,
    bestStreak: 0,
    notes: 0,
  });

  // ------------------------------------------------------
  // 🪙 Firestore更新
  // ------------------------------------------------------
  useEffect(() => {
    if (!user?.uid || saving) return;
    (async () => {
      setSaving(true);
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const userStats = data.stats || {};

      const currentStreak = Number(data.currentBattleStreak ?? 0);
      const bestStreak = Number(data.bestBattleStreak ?? 0);
      const continueStreak = Boolean(data.continueStreak ?? false);
      const prevNotes = Number(userStats.battleNotes ?? 0);
      const prevDP = Number(userStats.doremiPoints ?? 0);

      // ✅ ストリーク更新ロジック
      const newStreak = correctCount > 0 ? currentStreak + 1 : 0;
      const newBest = Math.max(bestStreak, newStreak);
      const newNotes = prevNotes + 1;
      const newDP = prevDP + dpGain;

      await setDoc(
        ref,
        {
          currentBattleStreak: newStreak,
          bestBattleStreak: newBest,
          continueStreak: correctCount > 0,
          stats: { ...userStats, doremiPoints: newDP, battleNotes: newNotes },
          lastBattleResultAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setStats({
        totalDP: newDP,
        streak: newStreak,
        bestStreak: newBest,
        notes: newNotes,
      });

      // ✅ サウンド・演出
      const path = `/sounds/${themeName || "normal"}/battle_win.mp3`;
      const se = new Audio(path);
      se.volume = 0.8;
      se.play().catch(() => {});
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 2200);

      setSaving(false);
    })();
  }, [user]);

  // ------------------------------------------------------
  // 🎨 UI
  // ------------------------------------------------------
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-start pt-10 px-4 overflow-hidden"
      style={{ background: theme.background, color: theme.textColor }}
    >
      {/* 🌟 黄金波紋演出 */}
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

      {/* 🎵 ドレミノナビ */}
      <div className="mb-5">
        <NaviBubble
          message={
            fromBonus
              ? "ボーナスもがんばったね！✨"
              : correctCount >= 7
              ? "フルコンボ！真のチャンピオンだよ！🔥"
              : correctCount >= 4
              ? "いい戦いだったね！努力がDPになったよ！"
              : "がんばったね！努力の音はちゃんと響いてるよ🎵"
          }
          subMessage={`今回の報酬：＋${dpGain} DP`}
        />
      </div>

      {/* 🏆 結果カード */}
      <motion.div
        className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 w-full max-w-md text-center border border-yellow-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-2xl font-bold mb-2">🎯 バトル結果</div>
        <div className="text-gray-700 mb-4">
          正解数：<strong>{correctCount}</strong> 問 <br />
          獲得DP：<strong>＋{dpGain}</strong> DP
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 text-left text-sm shadow-inner mb-4">
          <p>💎 総DP：{stats.totalDP}</p>
          <p>🎵 音符：{stats.notes} / 7</p>
          <p>🔥 連続ストリーク：{stats.streak}（最高 {stats.bestStreak}）</p>
        </div>

        <motion.button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl shadow hover:opacity-90"
          whileTap={{ scale: 0.95 }}
        >
          🏠 ホームへ戻る
        </motion.button>
      </motion.div>

      {/* 🎶 補足演出 */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            className="absolute bottom-10 text-center text-white/80 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            「努力の音が、次のバトルへ響く…🎵」
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
