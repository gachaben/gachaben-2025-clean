import React, { useState } from "react";

const keys = ["7","8","9","4","5","6","1","2","3","0","⌫","OK"];

export default function KeypadView({ question, onCorrect, onWrong }) {
  const [val, setVal] = useState("");

  function press(k) {
    if (k === "⌫") { setVal(s => s.slice(0, -1)); return; }
    if (k === "OK") {
      const ok = val === String(question.correctAnswer ?? "");
      ok ? onCorrect() : onWrong();
      return;
    }
    setVal(s => (s + k).slice(0, 12)); // 12桁に制限(任意)
  }

  return (
    <div>
      <div style={{ fontSize: 22, margin: "8px 0", minHeight: 28 }}>{val || "..."}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 80px)", gap: 8 }}>
        {keys.map(k => (
          <button key={k} onClick={() => press(k)} style={{ padding: "12px 0" }}>{k}</button>
        ))}
      </div>
    </div>
  );
}
