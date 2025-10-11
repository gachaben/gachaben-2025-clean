// ------------------------------------------------------
// ⏰ Timer.jsx（仮版）
// ドレミチャレンジ用のシンプルタイマー表示
// ------------------------------------------------------
import React, { useEffect, useState } from "react";

export default function Timer({ seconds = 15, onTimeout }) {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) {
      onTimeout && onTimeout();
      return;
    }
    const timer = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [time]);

  return (
    <div className="text-lg font-bold text-gray-700 bg-white/70 px-4 py-1 rounded-full shadow-md border border-gray-200">
      ⏰ 残り <span className="text-pink-500">{time}</span> 秒
    </div>
  );
}
