// src/components/SequenceView.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * props:
 * - items: [{id:"1", text:"カ"}, ...] or ["カ","ブ","ト"]
 * - answer: ["カ","ブ","ト"] もしくは [["カ","ブ","ト"], ["甲","武","土"]]
 * - onCorrect, onWrong, questionId
 */
export default function SequenceView({ items = [], answer = [], onCorrect, onWrong, questionId }) {
  // items を {id,text} に正規化
  const base = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.map((it, i) =>
      typeof it === "string"
        ? { id: String(i), text: it }
        : { id: String(it.id ?? i), text: String(it.text ?? it) }
    );
  }, [items]);

  const [order, setOrder] = useState([]); // 並べた id の配列

  useEffect(() => {
    setOrder([]); // 問題切り替えでリセット
  }, [questionId]);

  const remaining = base.filter((b) => !order.includes(b.id));
  const chosen = order.map((id) => base.find((b) => b.id === id)).filter(Boolean);

  const add = (id) => setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const removeAt = (idx) =>
    setOrder((prev) => prev.filter((_, i) => i !== idx));

  const norm = (v) => (Array.isArray(v) ? v.join("") : String(v ?? ""));
  const current = norm(chosen.map((c) => c.text));
  const ok =
    Array.isArray(answer) && Array.isArray(answer[0])
      ? answer.some((a) => norm(a) === current)
      : norm(answer) === current;

  const confirm = () => (ok ? onCorrect?.() : onWrong?.());

  return (
    <div className="space-y-3">
      {/* 並び結果 */}
      <div className="p-2 rounded-md border">
        <div className="text-sm opacity-70 mb-1">並べた順序</div>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
          {chosen.length === 0 && <span className="opacity-50">（未選択）</span>}
          {chosen.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => removeAt(idx)}
              className="px-3 py-1 rounded-md border"
              title="この要素を外す"
            >
              {c.text}
            </button>
          ))}
        </div>
      </div>

      {/* 候補 */}
      <div className="flex flex-wrap gap-2">
        {remaining.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => add(r.id)}
            className="px-3 py-2 rounded-md border"
          >
            {r.text}
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={confirm}
          disabled={order.length === 0}
          className={`px-4 py-2 rounded-md border ${order.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          確定
        </button>
      </div>
    </div>
  );
}
