// ------------------------------------------------------
// 🎶 NoteBurstGold.jsx（金色音符の舞い演出）
// ------------------------------------------------------
// 勝利時やコンプリート時に呼び出す。
// props:
//  - count: 音符数（デフォルト7）
//  - mode: "gold" or "rainbow"（色のパターン）
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function NoteBurstGold({ count = 7, mode = "gold" }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const palette =
      mode === "rainbow"
        ? ["#ff0000", "#ffa500", "#ffff00", "#00ff00", "#00bfff", "#0000ff", "#8a2be2"]
        : ["#fff8dc", "#ffe066", "#ffd700", "#facc15", "#fef08a", "#fcd34d", "#fbbf24"];
    const icons = ["🎵", "♪", "♫"];
    const arr = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 200,
      y: -Math.random() * 120 - 50,
      rot: Math.random() * 360,
      delay: Math.random() * 0.6,
      color: palette[i % palette.length],
      icon: icons[Math.floor(Math.random() * icons.length)],
    }));
    setNotes(arr);
  }, [count, mode]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[950] overflow-visible">
      {notes.map((n) => (
        <motion.div
          key={n.id}
          className="absolute text-3xl font-bold drop-shadow-md"
          style={{
            top: "50%",
            left: "50%",
            color: n.color,
          }}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: n.x,
            y: n.y,
            rotate: n.rot,
            scale: [0.8, 1.2, 0.9],
          }}
          transition={{
            duration: 2.4,
            delay: n.delay,
            ease: "easeOut",
          }}
        >
          {n.icon}
        </motion.div>
      ))}
    </div>
  );
}
