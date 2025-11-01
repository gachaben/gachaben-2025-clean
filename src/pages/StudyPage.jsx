// ------------------------------------------------------
// 📘 StudyPage.jsx（LessonPage統合版 / 旧UI削除済み）
// ------------------------------------------------------
import React from "react";
import LessonPage from "@/pages/LessonPage"; // ✅ LessonPage を呼び出し
import { motion } from "framer-motion";

export default function StudyPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-sky-200 text-center relative">
      {/* ✅ LessonPageを表示（クリック透過問題のない新UI） */}
      <LessonPage />

      {/* ✅ 背景アニメーションや将来演出が必要な場合はここに追加可 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-4 text-blue-500 font-bold"
      >
        🎵 学習チャレンジ
      </motion.div>
    </div>
  );
}
