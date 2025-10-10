// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import NoteTrack from "@/components/ui/NoteTrack";

export default function HomePage() {
  const [progress, setProgress] = useState(0);

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-100 to-blue-300">
      <h1 className="text-lg font-bold text-blue-700 mb-4">音符ゲージテスト</h1>
      <NoteTrack
        progress={progress}
        onFull={() => console.log("🎵 ドレミ×2 キュイーン発動！")}
      />
    </div>
  );
}
