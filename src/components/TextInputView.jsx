import React, { useState, useMemo } from "react";

/**
 * 記述式ビュー（type: 'text'）
 * - 正解は question.correctAnswer（文字列）
 * - 複数正解を許したい場合は question.altAnswers (string[]) を利用（任意）
 * - 大文字小文字/空白/全角半角のゆらぎを吸収して比較
 */
export default function TextInputView({ question, onCorrect, onWrong }) {
  const [val, setVal] = useState("");
  const [msg, setMsg] = useState("");

  const answers = useMemo(() => {
    const main = String(question.correctAnswer ?? "");
    const alts = Array.isArray(question.altAnswers) ? question.altAnswers : [];
    return [main, ...alts].map(normalize);
  }, [question.id]);

  function normalize(s) {
    // 前後空白除去 → 全角→半角 → 全て小文字
    return String(s ?? "")
      .trim()
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " "); // 連続空白は1つに
  }

  function submit() {
    const ok = answers.includes(normalize(val));
    if (ok) {
      setMsg("OK!");
      onCorrect();
    } else {
      setMsg("ちがう… もう一度。");
      onWrong();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
      <input
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="ここに入力"
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ccc",
          fontSize: 16
        }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={submit} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          送信
        </button>
        <button onClick={() => setVal("")} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ccc" }}>
          クリア
        </button>
      </div>
      <div style={{ minHeight: 22, color: "#666" }}>{msg}</div>
    </div>
  );
}
