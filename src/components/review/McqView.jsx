import React, { useMemo, useState } from "react";

export default function McqView({ question, onCorrect, onWrong }) {
  const init = useMemo(() => {
    const base = Array.isArray(question.options) && question.options.length >= 2
      ? question.options
      : [String(question.correctAnswer ?? ""), `${question.correctAnswer}※1`, `${question.correctAnswer}※2`, `${question.correctAnswer}※3`];
    return [...new Set(base)].sort(() => Math.random() - 0.5);
  }, [question.id]);

  const [choices, setChoices] = useState(init);

  function pick(opt) {
    const ok = String(opt) === String(question.correctAnswer ?? "");
    if (ok) onCorrect();
    else {
      setChoices(prev => prev.filter(c => c !== opt)); // 不正解は減らす
      onWrong();
    }
  }

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      {choices.map(c => (
        <button key={c} onClick={() => pick(c)} style={{ padding: "10px 12px", textAlign: "left" }}>
          {c}
        </button>
      ))}
    </div>
  );
}
