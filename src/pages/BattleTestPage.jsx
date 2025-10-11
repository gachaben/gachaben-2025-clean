// ------------------------------------------------------
// ⚔️ src/pages/BattleTestPage.jsx
// バトル音符ゲージテストページ
// ------------------------------------------------------
console.log("📘 BattleTestPage file imported");

import React, { useEffect, useState } from "react";
import NoteTrackBattle from "@/components/ui/NoteTrackBattle";

export default function BattleTestPage() {
  console.log("✅ BattleTestPage loaded");

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 105 ? 0 : p + 15));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-red-100 to-orange-200 relative">
      <h1 className="text-lg font-bold text-red-700 mb-4">
        バトル音符ゲージ テスト
      </h1>

      {/* 🧩 音符ゲージ */}
      <NoteTrackBattle progress={progress} onFull={() => console.log("🔥 MAX!")} />

      <p className="text-sm text-gray-700 mt-4">⚔️ 3秒ごとに音符が点灯します</p>
    </div>
  );
}
