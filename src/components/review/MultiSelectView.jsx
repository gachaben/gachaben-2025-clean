import React, { useMemo, useState } from "react";

/**
 * 複数選択ビュー（type: 'multi'）
 *
 * データ仕様：
 * - question.question: 表示するお題（例：「3になるものをすべて選ぼう」）
 * - question.options: ["2+2","2+1","1+1","3"] のような配列
 *
 * 正解の指定は2通り：
 * A) question.correctOptions: 正解の文字列配列（["2+1","3"]）
 * B) ルール指定（question.meta で）
 *    - meta.rule: "equals"
 *    - meta.target: "3"  // 目標値
 *    - meta.eval: "arith" // "2+1" 等の四則を計算して比較（簡易）
 */
export default function MultiSelectView({ question, onCorrect, onWrong }) {
  const [picked, setPicked] = useState(new Set());
  const [msg, setMsg] = useState("");

  // --- ユーティリティ ---
  function evalArith(s) {
    const safe = String(s ?? "").replace(/[^0-9+\-*/().\s]/g, "");
    try {
      // 極シンプル評価（四則のみ想定）
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict"; return (${safe})`)();
      return Number.isFinite(v) ? v : NaN;
    } catch {
      return NaN;
    }
  }

  // 正解集合を作る
  const correctSet = useMemo(() => {
    // A: 直接配列で渡された場合（最優先）
    if (Array.isArray(question.correctOptions) && question.correctOptions.length > 0) {
      return new Set(question.correctOptions.map(String));
    }
    // B: ルール指定（= target）で判定
    if (question?.meta?.rule === "equals" && question?.meta?.target != null) {
      const target = Number(question.meta.target);
      const useEval = question?.meta?.eval === "arith";
      const ans = [];
      for (const opt of question.options ?? []) {
        const val = useEval ? evalArith(opt) : Number(opt);
        if (Number.isFinite(val) && val === target) ans.push(String(opt));
      }
      return new Set(ans);
    }
    // どちらも無ければ空（全選択は不正解扱い）
    return new Set();
  }, [question.id]);

  const options = Array.isArray(question.options) ? question.options.map(String) : [];

  function toggle(opt) {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt); else next.add(opt);
      return next;
    });
  }

  function submit() {
    const a = [...picked].sort().join("|");
    const b = [...correctSet].sort().join("|");
    const ok = a === b && correctSet.size > 0;
    if (ok) {
      setMsg("正解！🎉");
      onCorrect();
    } else {
      setMsg("ちがう… もう一度。");
      onWrong();
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map(opt => {
          const active = picked.has(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #ccc",
                background: active ? "#eef6ff" : "white",
                outline: active ? "2px solid #7aa6ff" : "none",
                cursor: "pointer"
              }}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          送信
        </button>
        <button onClick={() => setPicked(new Set())} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          クリア
        </button>
      </div>

      <div style={{ minHeight: 22, color: "#666" }}>{msg}</div>
    </div>
  );
}
