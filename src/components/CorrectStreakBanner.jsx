// ------------------------------------------------------
// src/components/CorrectStreakBanner.jsx
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function CorrectStreakBanner({ streak }) {
  if (!streak || streak === 0) return null;

  // ステータスごとに演出を変化
  const getStyle = () => {
    if (streak < 5) return "bg-sky-200 text-sky-800";
    if (streak < 10) return "bg-yellow-200 text-yellow-800";
    if (streak < 20) return "bg-pink-200 text-pink-800";
    return "bg-purple-300 text-purple-900";
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 w-full py-2 text-center font-bold text-lg ${getStyle()} shadow-md`}
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      🎵 {streak}問連続正解中！
    </motion.div>
  );
}
