import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SequenceView from "@/components/review/SequenceView";
import GroupView from "@/components/review/GroupView";
import { consumeOneHeart } from "../lib/hearts";

/* =========================
   子コンポ�Eネント（外に出す！E
   ========================= */
function MCQView({ text, options = [], answer, setDebugYou, isCorrectAnswer, judge }) {
  const [picked, setPicked] = useState(null);

  const labelOf = (op) => String(op?.label ?? op?.value ?? op);

  const handlePick = (idx) => {
    const lbl = labelOf(options[idx]);
    setPicked(idx);
    setDebugYou(lbl);
  };

  const confirm = () => {
    if (picked == null) return;
    const you = labelOf(options[picked]);
    setDebugYou(you);
    const ok = isCorrectAnswer(you, answer);
    judge(ok);
  };

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
        disabled={picked == null}
        aria-disabled={picked == null}
        className={`px-4 py-2 rounded-md border mt-2 ${picked == null ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        確宁E
      </button>
    </div>
  );
}

function TextView({ text, answer, setDebugYou, isCorrectAnswer, judge }) {
  const [val, setVal] = useState("");
  const confirm = () => {
    const ok = isCorrectAnswer(val, answer);
    judge(ok);
  };
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
        placeholder="ここに入劁E
      />
      <button
        type="button"
        onClick={confirm}
        disabled={!val}
        className={`px-4 py-2 rounded-md border ${!val ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        確宁E
      </button>
    </div>
  );
}

/* =========================
   親コンポ�EネンチE
   ========================= */
export default function ReviewPlayPage() {
  const { mid } = useParams();             // /review/play/:mid
  const { state } = useLocation();         // state?.ids（将来queue対応する用）
  const navigate = useNavigate();

  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState(auth.currentUser?.uid ?? null);
  const [loading, setLoading] = useState(true);
  const [mistake, setMistake] = useState(null);
  const [error, setError] = useState("");

  // 認証追従
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  // 問題ロード（1問MVP）
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!mid) throw new Error("IDが不正でぁE);
        const ref = doc(db, "mistakes", mid);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("チE�Eタが見つかりません");
        const data = { id: snap.id, ...snap.data() };
        if (uid && data.uid && data.uid !== uid) throw new Error("アクセス権がありません");
        if (!alive) return;
        setMistake(data);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        console.error("[ReviewPlay] load error:", e);
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

  // ナビゲーション�E�正誤時�E画面遷移�E�E
  const goCorrect = () => navigate("/review", { replace: true });
  const goWrong = () => alert("ざんねん！もぁE��度トライしてみよう");

  // ❤を消費してから正誤処琁E��実衁E
  const judge = async (ok) => {
    try {
      await consumeOneHeart(uid, `review-${q.id}-${Date.now()}`);
      ok ? goCorrect() : goWrong();
    } catch (e) {
      const code = e?.code || e?.message;
      if (code === "NO_HEART") {
        alert("❤が足りません。庁E��で回復してから再挑戦してね�E�E);
        navigate("/review"); // とりあえず一覧へ戻す（回復導線�E後で実裁E��E
      } else if (code === "NO_AUTH") {
        alert("ログイン状態を確認してください、E);
      } else {
        console.error("[ReviewPlay] judge error:", e);
        alert("エラーが起きました。時間をおいて再度お試しください。");
      }
    }
  };

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;
  if (!mistake) return <div style={{ padding: 16 }}>チE�Eタがありません</div>;

  // ---- データの表示用整形（フィールド揺れを吸収） ----
  const q = mistake || {};
  const type = String(q.type || "").toLowerCase();

  // Mcq/Keypad が期待する question 形にアダプト
  const questionForView = useMemo(() => {
    return {
      id: q.id,
      text: q.text || q.question?.text || q.q?.text || "",
      options: q.options || q.choices || q.question?.options || null,
      correctAnswer:
        q.correctAnswer ??
        q.answer ??
        q.correct?.text ??
        q.c?.text ??
        q.solution ??
        "",
      // 並べ替え/グループ用の tokens/items は各ビューに直接渡す
    };
  }, [q]);

  // group 用のトークン生成（answer から自動生成フォールバック）
  const groupTokens = useMemo(() => {
    const tokens = Array.isArray(q.tokens) ? q.tokens : [];
    if (tokens.length) {
      return tokens.map((t, i) => ({ id: String(t?.id ?? i), text: String(t?.text ?? t) }));
    }
    const ansRaw = questionForView.correctAnswer;
    if (ansRaw == null) return [];
    const arr = Array.isArray(ansRaw) ? ansRaw : String(ansRaw).split("");
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.map((ch, i) => ({ id: String(i), text: String(ch) }));
  }, [q.tokens, questionForView.correctAnswer]);

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs opacity-60">
        ID: {q.id} ／ type: {q.type || "-"}
      </div>

      {/* タイトル（問題文） */}
      {questionForView.text && (
        <div className="text-lg font-semibold">{questionForView.text}</div>
      )}

      {/* タイプ別ビュー */}
      {type === "sequence" && (
        <SequenceView
          questionId={q.id}
          items={q.items || q.tokens || []}
          answer={q.answer}
          onCorrect={() => judge(true)}
          onWrong={() => judge(false)}
        />
      )}

      {type === "group" && (
        <GroupView
          questionId={q.id}
          tokens={groupTokens}
          answer={q.answer}
          onCorrect={() => { setDebugYou("(group) 正解パターン"); judge(true); }}
          onWrong={() => { setDebugYou("(group) 現在�E�E + debugYou); judge(false); }}
        />
      )}

      {type === "mcq" && (
        <McqView
          question={questionForView}
          onCorrect={() => judge(true)}
          onWrong={() => judge(false)}
        />
      )}

      {(type === "text" || type === "keypad") && (
        <KeypadView
          question={questionForView}
          onCorrect={() => judge(true)}
          onWrong={() => judge(false)}
        />
      )}

      {/* 未対応タイチEↁE簡易テキスト�E力で判宁E*/}
      {!["sequence", "group", "mcq", "text", "keypad"].includes(type) && (
        <div>
          <div className="text-lg font-semibold mb-2">{q.text}</div>
          <div className="opacity-70 mb-3">
            タイチE<code>{q.type}</code> は未対応です（暫定テキスト�E力で判定！E
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate("/review")}
          className="px-3 py-2 border rounded"
        >
          戻る
        </button>
      </div>
    </div>
  );
}
