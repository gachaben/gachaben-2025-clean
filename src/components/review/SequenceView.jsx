import React, { useMemo, useState, useEffect } from "react";

export default function SequenceView({ question, onCorrect, onWrong }) {
  const answerTokens = useMemo(() => {
    return String(question.correctAnswer ?? "").split(" ").filter(Boolean);
  }, [question.id]);

  const initialPool = useMemo(() => {
    const src =
      Array.isArray(question.options) && question.options.length > 0
        ? [...question.options]
        : [...answerTokens];
    return [...src].sort(() => Math.random() - 0.5);
  }, [question.id]);

  const [remain, setRemain] = useState(initialPool);
  const [picked, setPicked] = useState([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) {
      const t = setTimeout(() => onCorrect(), 0);
      return () => clearTimeout(t);
    }
  }, [completed, onCorrect]);

  function pick(tok) {
    if (completed) return;
    const expected = answerTokens[picked.length];
    if (tok === expected) {
      const nextPicked = [...picked, tok];
      setPicked(nextPicked);
      setRemain(prev => prev.filter(t => t !== tok));
      if (nextPicked.length === answerTokens.length) setCompleted(true);
    } else {
      onWrong();
    }
  }

  function undo(idx) {
    if (completed) return;
    if (idx !== picked.length - 1) return;
    const tok = picked[picked.length - 1];
    setPicked(prev => prev.slice(0, -1));
    setRemain(prev => [...prev, tok]);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        組み立て中:&nbsp;
        {picked.map((t, i) => (
          <button
            key={i + "-" + t}
            onClick={() => undo(i)}
            style={{
              marginRight: 6,
              padding: "6px 10px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: i === picked.length - 1 && !completed ? "pointer" : "default",
              opacity: i === picked.length - 1 ? 1 : 0.8
            }}
            disabled={completed}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {remain.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => pick(t)}
            disabled={completed}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: completed ? "default" : "pointer",
              opacity: completed ? 0.6 : 1
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
