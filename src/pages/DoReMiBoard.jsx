// src/pages/DoReMiBoard.jsx
import React from "react";

const notes = ["do", "re", "mi", "fa", "so", "ra", "si", "do2"];

export default function DoReMiBoard() {
  const playNote = (note) => {
    const audio = new Audio(`/sounds/doremi/${note}.wav`);
    audio.currentTime = 0;
    audio.play();
  };

  const playScale = async () => {
    for (const note of notes) {
      playNote(note);
      await new Promise((r) => setTimeout(r, 500)); // 0.5秒間隔
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <h1>🎵 どれみ音システムテスト</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        {notes.map((note) => (
          <button
            key={note}
            onClick={() => playNote(note)}
            style={{
              width: 60,
              height: 60,
              borderRadius: 10,
              background: "#eef",
              fontSize: "18px",
            }}
          >
            {note}
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
