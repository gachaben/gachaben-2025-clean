// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "../legacy_deprecated/firebase";
import { doc, getDoc } from "firebase/firestore";
import SequenceView from "@/components/review/SequenceView";
import GroupView from "@/components/review/GroupView";

/* =========================
   子コンポーネント（外に出す）
   ========================= */
function MCQView({ text, options = [], answer, setDebugYou, isCorrectAnswer, onCorrect, onWrong }) {
  const [picked, setPicked] = useState(null);

  const labelOf = (op) => String(op?.label ?? op?.value ?? op);

  const handlePick = (idx) => {
    const lbl = labelOf(options[idx]);
    console.log("[MCQ] pick:", idx, lbl);
    setPicked(idx);
    setDebugYou(lbl);
  };

  const confirm = () => {
    console.log("[MCQ] confirm clicked. picked =", picked);
    if (picked == null) return;
    const you = labelOf(options[picked]);
    console.log("[MCQ] you=", you, "answer=", answer);
    setDebugYou(you);
    isCorrectAnswer(you, answer) ? onCorrect() : onWrong();
  };

  const isDisabled = picked == null;

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>

      <div className="flex flex-col gap-2" role="radiogroup" aria-label="choices">
        {options.map((op, idx) => {
          const label = labelOf(op);
          const active = picked === idx;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handlePick(idx)}
              className={`px-3 py-2 rounded-md border text-left ${active ? "ring-2 ring-offset-1" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={confirm}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={`px-4 py-2 rounded-md border mt-2 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        確定
      </button>

      <div className="text-xs opacity-70 mt-1">
        picked: <code>{String(picked)}</code>
      </div>
    </div>
  );
}

function TextView({ text, answer, setDebugYou, isCorrectAnswer, onCorrect, onWrong }) {
  const [val, setVal] = useState("");
  const confirm = () => (isCorrectAnswer(val, answer) ? onCorrect() : onWrong());
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      <input
        type="text"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setDebugYou(e.target.value);
        }}
        className="px-3 py-2 rounded-md border w-full"
        placeholder="ここに入力"
      />
      <button
        type="button"
        onClick={confirm}
        disabled={!val}
        className={`px-4 py-2 rounded-md border ${!val ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        確定
      </button>
    </div>
  );
}

/* =========================
   親コンポーネント
   ========================= */
export default function ReviewPlayPage() {
  const { mid } = useParams();
  const navigate = useNavigate();
  const uid = getAuth().currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [mistake, setMistake] = useState(null);
  const [error, setError] = useState("");
  const [debugYou, setDebugYou] = useState("");

  const q = mistake ?? {};

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!mid) throw new Error("IDが不正です");
        const ref = doc(db, "mistakes", mid);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("データが見つかりません");
        const data = { id: snap.id, ...snap.data() };
        if (uid && data.uid && data.uid !== uid) throw new Error("アクセス権がありません");
        if (!alive) return;
        setMistake(data);
        setLoading(false);
      } catch (e) {
        console.error("[ReviewPlay] load error:", e);
        if (!alive) return;
        setError(e?.message || "読み込みに失敗しました");
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [mid, uid]);

  const normalize = (val) => {
    if (val == null) return "";
    if (Array.isArray(val)) return val.map((x) => String(x)).join("");
    return String(val);
  };
  const isCorrectAnswer = (user, answer) => {
    const u = normalize(user);
    if (Array.isArray(answer) && Array.isArray(answer[0])) {
      return answer.some((a) => normalize(a) === u);
    }
    return normalize(answer) === u;
  };

  const groupTokens = useMemo(() => {
    const tokens = Array.isArray(q.tokens) ? q.tokens : [];
    if (tokens.length) {
      return tokens.map((t, i) => ({ id: String(t?.id ?? i), text: String(t?.text ?? t) }));
    }
    const ansRaw = q?.answer;
    if (ansRaw == null) return [];
    const ans = Array.isArray(ansRaw) ? ansRaw : String(ansRaw || "");
    const chars = Array.isArray(ans) ? ans : String(ans).split("");
    const shuffled = [...chars].sort(() => Math.random() - 0.5);
    return shuffled.map((ch, i) => ({ id: String(i), text: String(ch) }));
  }, [q]);

  const onCorrect = () => navigate("/review", { replace: true });
  const onWrong = () => alert("ざんねん！もう一度トライしてみよう");

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;
  if (!mistake) return <div style={{ padding: 16 }}>データがありません</div>;

  const type = String(q.type || "").toLowerCase();

  return (
    <div style={{ padding: 16 }}>
      <div className="text-xs opacity-60 mb-2">ID: {q.id} / type: {q.type}</div>

      {type === "sequence" && (
        <SequenceView
          questionId={q.id}
          items={q.items || q.tokens || []}
          answer={q.answer}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      )}

      {type === "group" && (
        <GroupView
          questionId={q.id}
          tokens={groupTokens}
          answer={q.answer}
          onCorrect={() => { setDebugYou("(group) 正解パターン"); onCorrect(); }}
          onWrong={() => { setDebugYou("(group) 現在＝" + debugYou); onWrong(); }}
        />
      )}

      {type === "mcq" && (
        <MCQView
          text={q.text}
          options={q.options || q.choices || []}
          answer={q.answer}
          setDebugYou={setDebugYou}
          isCorrectAnswer={isCorrectAnswer}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      )}

      {(type === "text" || type === "keypad") && (
        <TextView
          text={q.text}
          answer={q.answer}
          setDebugYou={setDebugYou}
          isCorrectAnswer={isCorrectAnswer}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      )}

      {!["sequence", "group", "mcq", "text", "keypad"].includes(type) && (
        <div>
          <div className="text-lg font-semibold mb-2">{q.text}</div>
          <div className="opacity-70 mb-3">
            タイプ <code>{q.type}</code> は未対応です（暫定テキスト入力で判定）
          </div>
          <TextView
            text={q.text}
            answer={q.answer}
            setDebugYou={setDebugYou}
            isCorrectAnswer={isCorrectAnswer}
            onCorrect={onCorrect}
            onWrong={onWrong}
          />
        </div>
      )}

      <div className="mt-6">
        <button type="button" onClick={() => navigate("/review")} className="px-3 py-2 rounded-md border">
          戻る
        </button>
      </div>

      {/* DEBUG HUD */}
      <div style={{ marginTop: 24, padding: 12, border: "1px dashed #bbb", borderRadius: 8, background: "#fafafa" }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Debug</div>
        <div style={{ fontSize: 12, lineHeight: 1.6 }}>
          <div>type: <code>{String(q.type)}</code></div>
          <div>answer: <code>{Array.isArray(q.answer) ? JSON.stringify(q.answer) : String(q.answer ?? "")}</code></div>
          {Array.isArray(q.options) && (<div>options: <code>{JSON.stringify(q.options)}</code></div>)}
          {Array.isArray(groupTokens) && groupTokens.length > 0 && (
            <div>tokens: <code>{JSON.stringify(groupTokens.map((t) => t.text))}</code></div>
          )}
          <div>you: <code>{String(debugYou)}</code></div>
        </div>
      </div>
    </div>
  );
}
