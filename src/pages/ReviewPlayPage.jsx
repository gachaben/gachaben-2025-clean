import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SequenceView from "@/components/review/SequenceView";
import GroupView from "@/components/review/GroupView";
import McqView from "@/components/review/McqView";
import KeypadView from "@/components/review/KeypadView";
import { consumeOneHeart } from "@/lib/hearts";

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
        if (!mid) throw new Error("IDが不正です");
        setLoading(true);
        const ref = doc(db, "mistakes", mid);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("データが見つかりません");
        const data = { id: snap.id, ...(snap.data() || {}) };
        // 所有者チェック（フィールドは userId に統一推奨）
        if (uid && data.userId && data.userId !== uid) throw new Error("アクセス権がありません");
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
  }, [db, mid, uid]);

  // ❤消費→判定の共通処理
  const judge = async (ok) => {
    try {
      if (!uid) throw { code: "NO_AUTH" };
      await consumeOneHeart(uid, `review-${mid}-${Date.now()}`);
      if (ok) {
        // 1問MVP：終わったら一覧へ
        navigate("/review", { replace: true });
      } else {
        alert("ざんねん！もう一度トライしてみよう");
      }
    } catch (e) {
      const code = e?.code || e?.message;
      if (code === "NO_HEART") {
        alert("❤が足りません。回復してから再挑戦してね。");
        navigate("/review");
      } else if (code === "NO_AUTH") {
        alert("ログイン状態を確認してください。");
      } else {
        console.error("[ReviewPlay] judge error:", e);
        alert("エラーが起きました。時間をおいて再度お試しください。");
      }
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4">エラー: {error}</div>;
  if (!mistake) return <div className="p-4">データがありません</div>;

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
          onCorrect={() => judge(true)}
          onWrong={() => judge(false)}
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

      {/* 未対応タイプ → 暫定 Keypad で判定 */}
      {!["sequence", "group", "mcq", "text", "keypad"].includes(type) && (
        <div className="opacity-70 text-sm">
          （タイプ <code>{q.type}</code> は未対応のため、数値入力で暫定対応）
          <div className="mt-2">
            <KeypadView
              question={questionForView}
              onCorrect={() => judge(true)}
              onWrong={() => judge(false)}
            />
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
