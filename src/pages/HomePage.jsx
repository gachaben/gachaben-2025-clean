// ------------------------------------------------------
// 🎵 src/pages/HomePage.jsx（ログイン音符＋波動同期＋虹ゲージ＋シーズン背景）
// ------------------------------------------------------
// ・下部にログイン音符ゲージ（𝄞 ト音記号 × 虹グラデ）
// ・ゲージが満タンになると NoteBurst が中央で波打つ
// ・背景には今月のシーズンテーマ音符（🎹 鍵盤楽器）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrackLogin from "@/components/ui/NoteTrackLogin";
import NoteBurst from "@/components/NoteBurst";
import SeasonTitleBg from "@/components/ui/SeasonTitleBg";

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

  // 🌊 満タン時に波を出す
  const handleFull = () => {
    console.log("🌈 プレミアムガチャ解放！");
    setShowWave(true);
    setTimeout(() => setShowWave(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300 relative overflow-hidden">
      {/* 🎹 今月のシーズン背景（音符が上下に舞う演出） */}
      <SeasonTitleBg themeIcon="🎹" themeName="鍵盤楽器シリーズ" />

      <h1 className="text-lg font-bold text-blue-700 mb-6 z-10 relative">
        🌈 ト音記号ログインゲージテスト
      </h1>

      {/* 🌈 ト音記号ゲージ */}
      <div className="z-10 relative">
        <NoteTrackLogin progress={progress} onFull={handleFull} />
      </div>

      {/* 🌊 満タン時の波演出 */}
      {showWave && (
        <div
          className="absolute z-50"
          style={{
            bottom: "50%", // ゲージの位置合わせ
            transform: "translateY(60%)",
          }}
        >
          <NoteBurst
            type="premium"
            mode="sequence"
            labels={Array(7).fill("𝄞")}
            intervalMs={300}
            waveDelayMs={200}
            waveStepMs={100}
          />
        </div>
      )}

      <p className="text-sm mt-4 text-blue-600 z-10 relative">
        👆 画面をタップして音を解禁（デモ用）
      </p>
    </div>
  );
}
