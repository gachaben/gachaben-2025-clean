import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * props 例
 * - tokens: [{ id:"t1", text:"カ", }, { id:"t2", text:"ブ" }, ...]  // 並べて答えを作る素材
 * - answer: ["カ","ブ","ト"] もしくは [["カ","ブ","ト"], ["甲","武","土"]] のような複数解OK
 * - onCorrect(): void
 * - onWrong(): void
 * - questionId: string | number  // 質問切替検知用（リセットに使う）
 */
export default function GroupView({
  tokens = [],
  answer = [],
  onCorrect,
  onWrong,
  questionId,
}) {
  // 選択保持は「IDの配列」で管理（オブジェクトごと入れると再レンダーで参照がズレがち）
  const [activeIds, setActiveIds] = useState([]); // ["t1","t3",...]
  const [submitting, setSubmitting] = useState(false); // 二重押し防止

  // ✅ 質問が切り替わったら選択リセット
  useEffect(() => {
    setActiveIds([]);
    setSubmitting(false);
  }, [questionId]);

  // id -> token の O(1) 参照
  const tokenMap = useMemo(() => {
    const map = new Map();
    tokens.forEach((t) => map.set(String(t.id), t));
    return map;
  }, [tokens]);

  // 画面表示用：「組み立て中」の配列（text）
  const activeTexts = useMemo(() => {
    return activeIds.map((id) => tokenMap.get(String(id))?.text ?? "");
  }, [activeIds, tokenMap]);

  // ▼ よくあるバグ：
  // 1) setState で前回の state を読まずに上書き → 反映されない/消える
  // 2) index を key/識別子に使う → 配列の並び替えでズレる
  // ⇒ なので「functional setState + 安定ID」で実装

  const toggleToken = (id) => {
    const safeId = String(id);
    setActiveIds((prev) => {
      // 既に選択 → 解除（順序は維持）
      if (prev.includes(safeId)) {
        return prev.filter((x) => x !== safeId);
      }
      // 未選択 → 末尾に追加（順序が答えになる）
      return [...prev, safeId];
    });
  };

  // 「確定」ボタンの活性/非活性
  const canConfirm = activeIds.length > 0 && !submitting;

  // 答えの比べ方：
  // - answer が一次元（["カ","ブ","ト"]）ならそれと一致かを見る
  // - 多解対応で二次元（[["カ","ブ","ト"],["甲","武","土"]])もOKにする
  const isCorrect = () => {
    const now = activeTexts.join("");
    const normalize = (x) => (Array.isArray(x) ? x.join("") : String(x));
    if (Array.isArray(answer) && Array.isArray(answer[0])) {
      // 二次元（多解）
      return answer.some((arr) => normalize(arr) === now);
    }
    // 一次元
    return normalize(answer) === now || normalize(answer) === activeTexts.join("");
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true); // 二重防止

    try {
      if (isCorrect()) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
    } finally {
      // 判定が終わったら次問題でリセットされる前提。
      // 同一問題でやり直しを許したい場合はここで activeIds=[] にする。
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 組み立て中の表示（ここが消える＝state飛びを疑う場所） */}
      <div className="p-2 rounded-md border">
        <div className="text-sm opacity-70 mb-1">組み立て中</div>
        <div className="text-xl min-h-[2.5rem]">
          {activeTexts.length ? activeTexts.join("") : <span className="opacity-50">（未選択）</span>}
        </div>
      </div>

      {/* トークン一覧 */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((tok) => {
          const id = String(tok.id);
          const active = activeIds.includes(id);
          return (
            <button
              key={id} // ← index を絶対使わない
              type="button"
              onClick={() => toggleToken(id)} // ← onClick だけ（onMouseDown等は不要）
              className={`px-3 py-2 rounded-md border transition
                ${active ? "ring-2 ring-offset-1" : ""}`}
            >
              {tok.text}
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
          className={`px-4 py-2 rounded-md border
            ${canConfirm ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          確定
        </button>
      </div>
    </div>
  );
}
