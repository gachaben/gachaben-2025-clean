// src/pages/DoReMiBoard.jsx
import React, { useState } from "react";

const notes = [
  { id: "do", label: "ド", color: "#ff4d4d" }, // 赤
  { id: "re", label: "レ", color: "#ff9933" }, // オレンジ
  { id: "mi", label: "ミ", color: "#ffd633" }, // 黄
  { id: "fa", label: "ファ", color: "#66cc66" }, // 緑
  { id: "so", label: "ソ", color: "#3399ff" }, // 青
  { id: "ra", label: "ラ", color: "#6666ff" }, // 藍
  { id: "si", label: "シ", color: "#cc66ff" }, // 紫
  { id: "do2", label: "ド", color: "#ffffff" }, // 白（最後のド）
];

export default function DoReMiBoard() {
  const [activeNote, setActiveNote] = useState(null);
  const [ripple, setRipple] = useState(false);

  // 単音を鳴らす＋光らせる
  const playNote = async (noteId, duration = 200, color = "#fff") => {
    const audio = new Audio(`/sounds/doremi/${noteId}.wav`);
    audio.currentTime = 0;
    audio.play();

    setActiveNote(noteId);
    setTimeout(() => setActiveNote(null), duration);
  };

  // ドレミファソラシドを順番に再生（波紋は最後のドだけ）
  const playScale = async () => {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const isLast = i === notes.length - 1;
      const duration = isLast ? 1200 : 200;

      await playNote(note.id, duration, note.color);
      await new Promise((r) => setTimeout(r, duration + 100));

      // 最後のドだけ虹色波紋
      if (isLast) {
        setRipple(true);
        setTimeout(() => setRipple(false), 2000);
      }
    }
    setActiveNote(null);
  };

  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
        padding: "60px",
        overflow: "hidden",
        background: ripple
          ? "radial-gradient(circle, rgba(255,255,240,0.9) 0%, rgba(255,255,255,0) 80%)"
          : "linear-gradient(to bottom, #dfe9f3, #ffffff)",
        transition: "background 0.6s ease",
      }}
    >
      {/* 🌈 最後のドの時だけ虹色波紋 */}
      {ripple && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "0px",
            height: "0px",
            background:
              "conic-gradient(from 0deg, red, orange, yellow, green, cyan, blue, violet, red)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            animation: "ripple 1.8s ease-out forwards",
            opacity: 0.7,
            filter: "blur(8px)",
          }}
        />
      )}

      <h1>🌈 光るドレミファソラシド〜♪</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {notes.map((note) => (
          <button
            key={note.id}
            onClick={() => playNote(note.id, 200, note.color)}
            style={{
              width: 70,
              height: 70,
              borderRadius: 12,
              fontSize: "22px",
              fontWeight: "bold",
              transition: "all 0.15s ease",
              background:
                activeNote === note.id ? note.color : "#eef",
              color: activeNote === note.id ? "#fff" : "#333",
              boxShadow:
                activeNote === note.id
                  ? `0 0 25px 8px ${note.color}`
                  : "none",
            }}
          >
            {note.label}
          </button>
        ))}
      </div>

      <br />

      <button
        onClick={playScale}
        style={{
          padding: "10px 25px",
          fontSize: "18px",
          background: "linear-gradient(90deg, #ffb347, #ffcc33)",
          border: "none",
          borderRadius: "10px",
          color: "#333",
          fontWeight: "bold",
          boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
          transition: "transform 0.1s ease",
        }}
      >
        ▶️ ドレミファソラシド〜♪
      </button>

      <style>
        {`
          @keyframes ripple {
            0% {
              width: 0px;
              height: 0px;
              opacity: 0.9;
            }
            100% {
              width: 1200px;
              height: 1200px;
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}
