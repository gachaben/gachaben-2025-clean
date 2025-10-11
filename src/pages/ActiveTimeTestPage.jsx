// ------------------------------------------------------
// ⌛ src/pages/ActiveTimeTestPage.jsx
// 稼働時間音符ゲージテストページ（5分ごとに1音）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import NoteTrackActiveTime from "@/components/ui/NoteTrackActiveTime";

export default function ActiveTimeTestPage() {
  const [progress, setProgress] = useState(0);

  // ⏱ 3秒ごとに +15%（テスト用）
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 105 ? 0 : p + 15));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-100 to-blue-100 relative overflow-hidden">
      <h1 className="text-lg font-bold text-blue-700 mb-4">
        稼働時間音符ゲージテスト（⌛）
      </h1>

      <NoteTrackActiveTime
        progress={progress}
        onFull={() => console.log("⌛ 稼働MAX → プレミアムガチャ解放！")}
      />

      <p className="text-sm text-blue-600 mt-4">
        ⏱ 3秒ごとに音符が点灯（本番では5分単位に変更）
      </p>
    </div>
  );
}
