// src/context/RewardFxContext.jsx
import React, { createContext, useContext, useState } from "react";

const RewardFxContext = createContext(null);

export function RewardFxProvider({ children }) {
  const [hearts, setHearts] = useState([]);

  const triggerHeart = () => {
    // 💖5個のハートを中央から上方向へランダムに発生
    const newHearts = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + "-" + i,
      // 左右 ±20% の範囲でランダムに散る
      left: 50 + (Math.random() * 40 - 20),
      // 下じゃなく、画面中央付近から出す
      bottom: 40 + Math.random() * 10,
      // サイズをばらつかせる（24〜36px）
      size: 24 + Math.random() * 12,
      // 少しずつ出る
      delay: i * 150,
      // 飛ぶ方向のランダム角度
      driftX: Math.random() * 60 - 30,
      driftY: 120 + Math.random() * 80,
    }));

    setHearts(newHearts);

    // 3秒後に消す
    setTimeout(() => setHearts([]), 3000);
  };

  return (
    <RewardFxContext.Provider value={{ triggerHeart }}>
      {children}
      {/* 💖 ハート演出 */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="absolute text-pink-400 opacity-0 animate-float-heart"
            style={{
              left: `${h.left}%`,
              bottom: `${h.bottom}%`,
              fontSize: `${h.size}px`,
              animationDelay: `${h.delay}ms`,
              // 各ハートの飛び方向をCSS変数に渡す
              ["--drift-x"]: `${h.driftX}px`,
              ["--drift-y"]: `${h.driftY}px`,
            }}
          >
            💖
          </span>
        ))}
      </div>
    </RewardFxContext.Provider>
  );
}

export const useRewardFx = () => useContext(RewardFxContext);
