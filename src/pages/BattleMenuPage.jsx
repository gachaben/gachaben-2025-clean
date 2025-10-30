// ------------------------------------------------------
// 🥊 BattleMenuPage.jsx（券残数表示＋挑戦開始）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { db } from "@/fbkit/app";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function BattleMenuPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const auth = getAuth();
  const user = auth.currentUser;
  const [tickets, setTickets] = useState(0);

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};
      setTickets(Number(data?.tickets ?? 0));
    })();
  }, [user]);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden transition-all duration-700"
      style={{ background: theme.background, color: theme.textColor }}
    >
      <motion.h1
        className="text-3xl font-bold mb-3 drop-shadow-lg z-10"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🥊 バトルメニュー
      </motion.h1>

      <div className="z-10 bg-white/70 rounded-2xl backdrop-blur p-4 shadow mb-6">
        <div className="text-gray-700">🎫 バトル券：<b>{tickets}</b> / 7</div>
        <div className="text-xs text-gray-500 mt-1">
          ※券が0でも挑戦できます（広告視聴枠は後で導入）
        </div>
      </div>

      <motion.button
        onClick={() => navigate("/battle/challenge")}
        className="px-8 py-3 rounded-2xl font-bold text-white shadow hover:scale-105 transition z-10"
        style={{ background: theme.accent }}
        whileTap={{ scale: 0.95 }}
      >
        🎼 挑戦をはじめる（7問 / 4先取）
      </motion.button>
    </div>
  );
}
