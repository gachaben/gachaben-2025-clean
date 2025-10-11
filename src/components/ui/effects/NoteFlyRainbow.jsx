// ------------------------------------------------------
// 🌈 src/components/ui/effects/NoteFlyRainbow.jsx
// ------------------------------------------------------
// 満タン時の共通エフェクト：虹色の音符が45°で4つ舞い上がる
// - trigger が true になるたびに再生
// - startBottom で発生位置（親内の相対%）を調整
// ------------------------------------------------------

import React, { useEffect, useState } from "react";

export default function NoteFlyRainbow({
  trigger = false,
  size = 28,
  duration = 3000,
  height = 180,          // 上昇の高さ(px)
  startBottom = "60%",   // 親の中での発生Y位置（%）
}) {
  const [flyNotes, setFlyNotes] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const rainbowColors = ["#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#5f27cd"];
    const angles = [-45, -15, 15, 45];

    const notes = Array.from({ length: 4 }).map((_, i) => {
      const theta = (angles[i] * Math.PI) / 180;       // 角度 → ラジアン
      const dx = Math.tan(theta) * height;             // 横の移動量
      return {
        id: `${Date.now()}-${i}`,
        color: rainbowColors[i % rainbowColors.length],
        delay: i * 0.15,
        size: size + Math.random() * 6,
        dx, // CSS 変数で渡す
      };
    });

    setFlyNotes(notes);

    const t = setTimeout(() => setFlyNotes([]), duration + 600);
    return () => clearTimeout(t);
  }, [trigger, size, duration, height]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {flyNotes.map((n) => (
        <span
          key={n.id}
          className="absolute"
          style={{
            left: "50%",
            bottom: startBottom, // ← 発生位置を親の中で調整
            fontSize: `${n.size}px`,
            color: n.color,
            opacity: 0,
            transform: "translateX(-50%)",
            // CSS 変数で横方向の移動量を渡す（最終到達点）
            "--dx": `${n.dx}px`,
            animation: `noteFlyRainbow ${duration}ms ease-out ${n.delay}s forwards`,
            filter: "drop-shadow(0 0 6px rgba(255,255,255,0.9))",
          }}
        >
          ♪
        </span>
      ))}

      <style>{`
        @keyframes noteFlyRainbow {
          0% {
            transform: translate(-50%, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--dx)), -${height}px) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
