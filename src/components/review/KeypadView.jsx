import React, { useState } from "react";

/**
 * props:
 *  - question: { id, text, correctAnswer: string|number }
 *  - onCorrect, onWrong
 */
const KEYS = ["7","8","9","4","5","6","1","2","3","0","⌫","OK"];

export default function KeypadView({ question, onCorrect, onWrong }) {
  const [val, setVal] = useState("");

  function press(k) {
    if (k === "⌫") {
      setVal((s) => s.slice(0, -1));
      return;
    }
    if (k === "OK") {
      const ok = val === String(question.correctAnswer ?? "");
      ok ? onCorrect?.() : onWrong?.();
      return;
    }
    setVal((s) => (s + k).slice(0, 12)); // 桁上限
  }

  return (
    <div>
      <div className="text-2xl my-2 min-h-[28px]">{val || "..."}</div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <button key={k} onClick={() => press(k)} className="py-3 border rounded" type="button">
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
