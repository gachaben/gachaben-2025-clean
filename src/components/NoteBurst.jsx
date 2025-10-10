// ------------------------------------------------------
// 🎵 NoteBurst.jsx（v1.3.1 試作版）
// ------------------------------------------------------
// type に応じて NOTE_KIND から音符形状と色を取得し、
// ふわっと舞う演出を生成。
// 例）<NoteBurst type="study" /> や <NoteBurst type="active" quiet />
// ------------------------------------------------------

import React, { useEffect, useState } from "react";
import { NOTE_KIND, getNoteKind } from "@/constants/noteKinds";

export default function NoteBurst({ type = "study", quiet = false }) {
  const [notes, setNotes] = useState([]);
  const kind = getNoteKind(type);

  useEffect(() => {
    // 表示する音符の数（quietなら控えめ）
    const count = quiet ? 3 : 6;
    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      size: 16 + Math.random() * 16,
      rotate: Math.random() * 360,
    }));
    setNotes(items);

    // コンポーネントが消えるときにリセット
    return () => setNotes([]);
  }, [type, quiet]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {notes.map((n) => (
        <span
          key={n.id}
          style={{
            position: "absolute",
            left: `${n.left}%`,
            bottom: 0,
            fontSize: `${n.size}px`,
            animation: `floatUp ${n.duration}s ease-out ${n.delay}s forwards`,
            transform: `rotate(${n.rotate}deg)`,
            color: kind.gradient
              ? "url(#rainbow-gradient)"
              : kind.color || "#fff",
            opacity: 0.9,
          }}
        >
          {kind.glyph}
        </span>
      ))}

      {/* 虹グラデーション対応 */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="25%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="75%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSSアニメーション */}
      <style>{`
  @keyframes floatUp {
    0% {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateY(-120px) scale(1.2);
      opacity: 0;
    }
  }
`}</style>

    </div>
  );
}
