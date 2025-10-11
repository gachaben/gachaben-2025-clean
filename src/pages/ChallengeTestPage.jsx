// ------------------------------------------------------
// ⚡ src/pages/ChallengeTestPage.jsx
// チャレンジ音符ゲージ（♬）テストページ
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrackChallenge from "@/components/ui/NoteTrackChallenge";

export default function ChallengeTestPage() {
  const [progress, setProgress] = useState(0);
  const [showReset, setShowReset] = useState(false);

  // ⏱ 3秒ごとに15%進行（7ステップで100%超え）
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + 15;
        if (next >= 105) {
          clearInterval(timer);
          setShowReset(true);
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleReset = () => {
    setProgress(0);
    setShowReset(false);
  };

  const handleFull = () => {
    console.log("⚡ チャレンジコンプリート → アイテムガチャ解放！");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-purple-100 to-blue-200 relative overflow-hidden">
      <h1 className="text-lg font-bold text-purple-700 mb-4">
        ⚡ チャレンジ音符ゲージ テスト
      </h1>

      <NoteTrackChallenge progress={progress} onFull={handleFull} />

      {showReset && (
        <button
          onClick={handleReset}
          className="mt-6 px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
        >
          リセット
        </button>
      )}
    </div>
  );
}
