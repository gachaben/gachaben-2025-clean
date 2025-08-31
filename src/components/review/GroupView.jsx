// src/components/review/GroupView.jsx
import React, { useEffect, useMemo, useState } from "react";

/**
 * props:
 * - tokens: [{ id:"t1", text:"カ" }, ...]  // 並べて答えを作る素材
 * - answer: ["カ","ブ","ト"] もしくは [["カ","ブ","ト"], ["甲","武","士"]] のような複数解OK
 * - onCorrect(): void
 * - onWrong(): void
 * - questionId: string | number  // 質問の切替検知（リセット用）
 */
export default function GroupView({
  tokens = [],
  answer = [],
  onCorrect,
  onWrong,
  questionId,
}) {
  // 安定したID配列で選択状態を管理
  const [activeIds, setActiveIds] = useState([]); // ["t1", "t3", ...]
  const [submitting, setSubmitting] = useState(false); // 二重押し防止

  // 質問が切り替わったら選択リセット
  useEffect(() => {
    setActiveIds([]);
    setSubmitting(false);
  }, [questionId]);

  // id -> token のマップ（O(1)参照）
  const tokenMap = useMemo(() => {
    const map = new Map();
    tokens.forEach((t) => map.set(String(t.id), t));
    return map;
  }, [tokens]);

  // 表示用（現在の並びの文字列配列）
  const activeTexts = useMemo(() => {
    return activeIds.map((id) => tokenMap.get(String(id))?.text ?? "");
  }, [activeIds, tokenMap]);

  // クリックで選択/解除
  const toggleToken = (id) => {
    const safeId = String(id);
    setActiveIds((prev) =>
      prev.includes(safeId) ? prev.filter((x) => x !== safeId) : [...prev, safeId]
    );
  };

  // 「確定」ボタンの活性/非活性
  const canConfirm = activeIds.length > 0 && !submitting;

  // 正誤判定
  const isCorrect = () => {
    const now = activeTexts.join("");
    const normalize = (x) => (Array.isArray(x) ? x.join("") : String(x ?? ""));
    if (Array.isArray(answer) && Array.isArray(answer[0])) {
      // 複数許容解（2次元配列）
      return answer.some((arr) => normalize(arr) === now);
    }
    // 単一解
    return normalize(answer) === now;
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    try {
      isCorrect() ? onCorrect?.() : onWrong?.();
    } finally {
      // 同一問題でやり直しを許すならここで activeIds=[] してもOK
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 現在の並び */}
      <div className="p-2 rounded-md border">
        <div className="text-sm opacity-70 mb-1">現在の並び</div>
        <div className="text-xl min-h-[2.5rem]">
          {activeTexts.length ? (
            activeTexts.join("")
          ) : (
            <span className="opacity-50">（未選択）</span>
          )}
        </div>
      </div>

      {/* トークン一覧（クリックで選択/解除） */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((tok) => {
          const id = String(tok.id);
          const active = activeIds.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleToken(id)}
              className={`px-3 py-1 rounded-md border ${
                active ? "bg-emerald-100" : "hover:bg-gray-50"
              }`}
              title={active ? "選択を外す" : "追加する"}
            >
              {String(tok.text ?? "")}
            </button>
          );
        })}
      </div>

      {/* 確定ボタン */}
      <div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`px-4 py-2 rounded-md border ${
            canConfirm ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
          }`}
        >
          確定
        </button>
      </div>
    </div>
  );
}
