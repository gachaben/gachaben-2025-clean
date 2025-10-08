// src/pages/DoReMiBoard.jsx
import React, { useState } from "react";

const notes = [
  { id: "do", label: "ド" },
  { id: "re", label: "レ" },
  { id: "mi", label: "ミ" },
  { id: "fa", label: "ファ" },
  { id: "so", label: "ソ" },
  { id: "ra", label: "ラ" },
  { id: "si", label: "シ" },
  { id: "do2", label: "ド" },
];

export default function DoReMiBoard() {
  const [activeNote, setActiveNote] = useState(null);

  // 単音を鳴らす＋光らせる
  const playNote = async (noteId) => {
    const audio = new Audio(`/sounds/doremi/${noteId}.wav`);
    audio.currentTime = 0;
    audio.play();

    setActiveNote(noteId);
    setTimeout(() => setActiveNote(null), 200); // 光る時間も短め
  };

  // ドレミファソラシドを順番に光らせて再生（テンポ速め）
  const playScale = async () => {
    for (const note of notes) {
      await playNote(note.id);
      await new Promise((r) => setTimeout(r, 250)); // ← ここを短く
    }
    setActiveNote(null);
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>🎵 どれみ音システムテスト</h1>

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
            onClick={() => playNote(note.id)}
            style={{
              width: 60,
              height: 60,
              borderRadius: 10,
              fontSize: "20px",
              fontWeight: "bold",
              transition: "all 0.15s ease",
              background:
                activeNote === note.id ? "#ffea8a" : "#eef",
              boxShadow:
                activeNote === note.id
                  ? "0 0 12px 4px rgba(255, 230, 100, 0.6)"
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
          padding: "10px 20px",
          fontSize: "18px",
          background: "#cce",
          borderRadius: "8px",
        }}
      >
        ▶️ ドレミファソラシド 再生
      </button>
    </div>
  );
}
