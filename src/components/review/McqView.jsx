import React, { useMemo, useState } from "react";

/**
 * props:
 *  - question: { id, text, options?: string[], correctAnswer: string }
 *  - onCorrect: () => void
 *  - onWrong: () => void
 */
export default function McqView({ question, onCorrect, onWrong }) {
  // 初期選択肢（options が無ければ正答からダミー生成）
  const initChoices = useMemo(() => {
    const base =
      Array.isArray(question.options) && question.options.length >= 2
        ? question.options
        : [
            String(question.correctAnswer ?? ""),
            `${question.correctAnswer}※1`,
            `${question.correctAnswer}※2`,
            `${question.correctAnswer}※3`,
          ];
    // 重複除去してシャッフル
    return [...new Set(base)].sort(() => Math.random() - 0.5);
  }, [question.id, question.correctAnswer, question.options]);

  const [choices, setChoices] = useState(initChoices);

  function pick(opt) {
    const ok = String(opt) === String(question.correctAnswer ?? "");
    if (ok) {
      onCorrect?.();
    } else {
      // 不正解は候補から除外（連打対策の簡易UX）
      setChoices((prev) => prev.filter((c) => c !== opt));
      onWrong?.();
    }
  }

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
      {choices.map((c) => (
        <button
          key={c}
          onClick={() => pick(c)}
          className="px-3 py-2 text-left border rounded"
          type="button"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
