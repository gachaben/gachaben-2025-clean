import React, { useMemo, useState, useEffect } from "react";

/**
 * 並べ替え（sequence）ビュー
 * - correctAnswer を空白区切りで分割して正解配列に
 * - options があれば候補プールに使う
 * - 最後まで正しい順で選んだら onCorrect() を「レンダー後」に呼ぶ
 */
export default function SequenceView({ question, onCorrect, onWrong }) {
  // 正解列
  const answerTokens = useMemo(() => {
    if (Array.isArray(question.options) && question.options.length > 0) {
      // options がある場合でも、正解の順序は correctAnswer に従う
      return String(question.correctAnswer ?? "").split(" ").filter(Boolean);
    }
    return String(question.correctAnswer ?? "").split(" ").filter(Boolean);
  }, [question.id]);

  // 候補プール（シャッフル）
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

  // ✅ 完了フラグが立った「後」で onCorrect を呼ぶ（親のsetStateと競合しない）
  useEffect(() => {
    if (completed) {
      // 少し遅延させてから呼ぶとさらに安全
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
      if (nextPicked.length === answerTokens.length) {
        setCompleted(true); // ← ここでは onCorrect を呼ばない
      }
    } else {
      onWrong();
    }
  }

  function undo(idx) {
    if (completed) return;
    // 最後に入れた1個だけ戻せる
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
            title={i === picked.length - 1 ? "最後の1個は戻せます" : ""}
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
