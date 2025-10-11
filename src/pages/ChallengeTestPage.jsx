// ------------------------------------------------------
// 🎸 src/pages/ChallengeTestPage.jsx（チャレンジ音符ゲージテスト）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrackChallenge from "@/components/ui/NoteTrackChallenge";

export default function ChallengeTestPage() {
  const [progress, setProgress] = useState(0);
  const [showWave, setShowWave] = useState(false);

  // ⏱ 3秒ごとに +15%（7回で105%）
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

  // 満タンになったら一時的に演出を出す
  const handleFull = () => {
    console.log("⚡ チャレンジ完了 → アイテムゲット！⚡");
    setShowWave(true);
    setTimeout(() => setShowWave(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-pink-100 to-indigo-200 relative overflow-hidden">
      <h1 className="text-lg font-bold text-pink-700 mb-4">
        チャレンジ音符ゲージテスト（♫）
      </h1>

      <NoteTrackChallenge progress={progress} onFull={handleFull} />

      <p className="text-sm mt-4 text-pink-600">
        🌟 チャレンジ完了 → アイテムガチャ報酬！
      </p>
      <p className="text-xs text-gray-500">⏱ 3秒ごとに音符が点灯します</p>
    </div>
  );
}
