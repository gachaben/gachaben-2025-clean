// ------------------------------------------------------
// 🎵 src/pages/HomePage.jsx（波動同期＋重ね位置調整版）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrack from "@/components/ui/NoteTrack";
import NoteBurst from "@/components/NoteBurst";

export default function HomePage() {
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

  // ゲージ満タン時に波を発動
  const handleFull = () => {
    console.log("🎵 ドレミ×2 キュイーン発動！");
    setShowWave(true);
    // 3秒後に非表示
    setTimeout(() => setShowWave(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300 relative overflow-hidden">
      <h1 className="text-lg font-bold text-blue-700 mb-4">音符ゲージテスト</h1>

      {/* 🌈 音符ゲージ */}
      <NoteTrack progress={progress} onFull={handleFull} />

      {/* 🌊 波打ちは満タン時だけ出現 */}
      {showWave && (
        <div
          className="absolute"
          style={{
            bottom: "50%", // ← NoteTrackの高さに合わせて調整
            transform: "translateY(60%)",
            zIndex: 50, // ← 前面に出す
          }}
        >
          <NoteBurst
            type="premium"
            mode="sequence"
            labels={Array(7).fill("♪")}
            intervalMs={300}
            waveDelayMs={200}
            waveStepMs={80}
          />
        </div>
      )}

      <p className="text-sm mt-4 text-blue-600">👆 画面をタップして音を解禁</p>
    </div>
  );
}
