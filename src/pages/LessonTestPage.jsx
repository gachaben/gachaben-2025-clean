// ------------------------------------------------------
// 🎶 src/pages/LessonTestPage.jsx（学習音符ゲージテスト）
// ------------------------------------------------------
// ・NoteTrackStudy を中央表示
// ・3秒ごとに +15%（7音で満タン）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrackStudy from "@/components/ui/NoteTrackStudy";

export default function LessonTestPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + 15;
        if (next > 105) clearInterval(timer);
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleFull = () => {
    console.log("📘 学習完了 → アイテムガチャ解放！");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-pink-100 to-blue-100">
      <h1 className="text-lg font-bold text-blue-700 mb-4">学習音符ゲージテスト（♪）</h1>

      <NoteTrackStudy progress={progress} onFull={handleFull} />

      <p className="text-sm mt-4 text-blue-600">📖 3秒ごとに音符が1つ点灯します</p>
    </div>
  );
}
