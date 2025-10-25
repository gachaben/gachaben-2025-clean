// ------------------------------------------------------
// 🎵 NoteProgress.jsx（7音ゲージ＋虹波アニメ）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import "@/styles/NoteProgress.css"; // 🌈 新規CSS追加（下記参照）

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
    <div className={`note-progress ${wave ? "wave" : ""}`}>
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
