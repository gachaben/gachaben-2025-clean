// ------------------------------------------------------
// 🎵 NoteProgress.jsx（クリック透過＋虹波アニメ対応版）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import "@/styles/NoteProgress.css";

export default function NoteProgress({ current = 0, isRainbow = false }) {
  const notes = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
  const [wave, setWave] = useState(false);

  // 🌈 全点灯したら波打ち発動
  useEffect(() => {
    if (isRainbow || current >= notes.length) {
      setWave(true);
      const t = setTimeout(() => setWave(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isRainbow, current]);

  return (
    <div
      className={`note-progress ${wave ? "wave" : ""}`}
      style={{
        pointerEvents: "none", // ✅ ←これを追加（クリック透過）
      }}
    >
      {notes.map((n, i) => (
        <span
          key={i}
          className={`note ${
            i < current ? "active" : ""
          } ${wave ? "rainbow" : ""}`}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
