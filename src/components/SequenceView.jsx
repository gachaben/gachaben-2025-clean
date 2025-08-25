// src/components/SequenceView.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * props:
 * - items: [{id:"1", text:"繧ｫ"}, ...] or ["繧ｫ","繝・,"繝・]
 * - answer: ["繧ｫ","繝・,"繝・] 繧ゅ＠縺上・ [["繧ｫ","繝・,"繝・], ["逕ｲ","豁ｦ","蝨・]]
 * - onCorrect, onWrong, questionId
 */
export default function SequenceView({ items = [], answer = [], onCorrect, onWrong, questionId }) {
  // items 繧・{id,text} 縺ｫ豁｣隕丞喧
  const base = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    return arr.map((it, i) =>
      typeof it === "string"
        ? { id: String(i), text: it }
        : { id: String(it.id ?? i), text: String(it.text ?? it) }
    );
  }, [items]);

  const [order, setOrder] = useState([]); // 荳ｦ縺ｹ縺・id 縺ｮ驟榊・

  useEffect(() => {
    setOrder([]); // 蝠城｡悟・繧頑崛縺医〒繝ｪ繧ｻ繝・ヨ
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
      {/* 荳ｦ縺ｳ邨先棡 */}
      <div className="p-2 rounded-md border">
        <div className="text-sm opacity-70 mb-1">荳ｦ縺ｹ縺滄・ｺ・/div>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
          {chosen.length === 0 && <span className="opacity-50">・域悴驕ｸ謚橸ｼ・/span>}
          {chosen.map((c, idx) => (
            <button
              key={c.id}
              type="button"
              onClick={() => removeAt(idx)}
              className="px-3 py-1 rounded-md border"
              title="縺薙・隕∫ｴ繧貞､悶☆"
            >
              {c.text}
            </button>
          ))}
        </div>
      </div>

      {/* 蛟呵｣・*/}
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
          遒ｺ螳・
        </button>
      </div>
    </div>
  );
}
