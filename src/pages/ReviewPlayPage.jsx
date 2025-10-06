<<<<<<< HEAD
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
=======
// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/fbkit";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/* -------------------- MCQ 選択問題 -------------------- */
function MCQView({ text, options = [], answer, judge }) {
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  const [picked, setPicked] = useState(null);

  const confirm = () => {
    if (picked == null) return;
<<<<<<< HEAD
    const you = labelOf(options[picked]);
    setDebugYou(you);
    const ok = isCorrectAnswer(you, answer);
    judge(ok);
=======
    const ok = options[picked] === answer;
    judge(ok, options[picked]);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      <div className="flex flex-col gap-2">
        {options.map((c, i) => (
          <button
            key={i}
            onClick={() => setPicked(i)}
            className={`px-3 py-2 rounded border ${
              picked === i ? "bg-blue-100" : "bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <button
        onClick={confirm}
        disabled={picked == null}
        className="px-4 py-2 rounded bg-emerald-600 text-white mt-2 disabled:opacity-50"
      >
        確宁E
      </button>
    </div>
  );
}

/* -------------------- Text 入力問題 -------------------- */
function TextView({ text, answer, judge }) {
  const [val, setVal] = useState("");

  const confirm = () => {
<<<<<<< HEAD
    const ok = isCorrectAnswer(val, answer);
    judge(ok);
=======
    if (!val) return;
    const ok = String(val).trim() === String(answer).trim();
    judge(ok, val);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      <input
        type="text"
        value={val}
<<<<<<< HEAD
        onChange={(e) => {
          setVal(e.target.value);
          setDebugYou(e.target.value);
        }}
        className="px-3 py-2 rounded-md border w-full"
        placeholder="ここに入劁E
=======
        onChange={(e) => setVal(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        placeholder="ここに入力"
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
      />
      <button
        onClick={confirm}
        disabled={!val}
        className="px-4 py-2 rounded bg-emerald-600 text-white mt-2 disabled:opacity-50"
      >
        確宁E
      </button>
    </div>
  );
}

<<<<<<< HEAD
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
=======
/* -------------------- Sequence 並べ替え問題 -------------------- */
function SequenceView({ text, tokens = [], answer, judge }) {
  const [seq, setSeq] = useState([]);

  useEffect(() => {
    const shuffled = [...tokens].sort(() => Math.random() - 0.5);
    setSeq(shuffled);
  }, [tokens]);

  const confirm = () => {
    const ans = tokens.join("");
    const you = seq.join("");
    const ok = ans === you;
    judge(ok, you);
  };

  const swap = (i, j) => {
    const arr = [...seq];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSeq(arr);
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      <div className="flex gap-2 flex-wrap">
        {seq.map((t, i) => (
          <button
            key={i}
            onClick={() => {
              if (i > 0) swap(i, i - 1);
              else if (i < seq.length - 1) swap(i, i + 1);
            }}
            className="px-3 py-2 border rounded bg-white"
          >
            {t}
          </button>
        ))}
      </div>
      <button
        onClick={confirm}
        className="px-4 py-2 rounded bg-emerald-600 text-white mt-2"
      >
        確認
      </button>
    </div>
  );
}

/* -------------------- Group 分類問題 -------------------- */
function GroupView({ text, tokens = [], groups = [], answer, judge }) {
  const [selected, setSelected] = useState({});

  const handlePick = (token, group) => {
    setSelected((prev) => ({ ...prev, [token]: group }));
  };

  const confirm = () => {
    const ok = tokens.every(
      (t) => selected[t] && answer[t] && selected[t] === answer[t]
    );
    judge(ok, JSON.stringify(selected));
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      {tokens.map((t) => (
        <div key={t} className="flex gap-2 items-center">
          <span className="w-20">{t}</span>
          <select
            className="border rounded px-2 py-1"
            onChange={(e) => handlePick(t, e.target.value)}
          >
            <option value="">選択</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      ))}
      <button
        onClick={confirm}
        className="px-4 py-2 rounded bg-emerald-600 text-white mt-2"
      >
        確認
      </button>
    </div>
  );
}

/* -------------------- 親コンポーネント -------------------- */
export default function ReviewPlayPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mistake, setMistake] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

  // 問題ロード（1問MVP）
  useEffect(() => {
    (async () => {
      try {
<<<<<<< HEAD
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
=======
        const ref = doc(db, "mistakes", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("問題が見つかりません");
        setMistake({ id: snap.id, ...snap.data() });
      } catch (e) {
        setError(e.message);
      } finally {
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
        setLoading(false);
      }
    })();
  }, [id]);

<<<<<<< HEAD
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
=======
  const judge = async (ok, you) => {
    try {
      if (!mistake?.id) return;
      await updateDoc(doc(db, "mistakes", mistake.id), {
        reviewStatus: ok ? "got" : "retry",
        reviewedAt: serverTimestamp(),
        lastAnswer: you,
      });
      setResult(ok ? "正解！🎉 復習完了" : "不正解 ❌ また挑戦してね");
    } catch (e) {
      console.error("update error", e);
      alert("更新に失敗しました");
    }
  };

  // セッション対応: 次の問題へ
  const nextFromSession = () => {
    const session = JSON.parse(localStorage.getItem("reviewSession") || "[]");
    if (!session.length) {
      navigate("/review/mistakes");
      return;
    }
    const idx = session.indexOf(mistake.id);
    if (idx >= 0 && idx + 1 < session.length) {
      navigate(`/review/play/${session[idx + 1]}`);
    } else {
      localStorage.removeItem("reviewSession");
      navigate("/review/mistakes");
    }
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">エラー: {error}</div>;
  if (!mistake) return <div className="p-4">問題データがありません</div>;

  const type = String(mistake.type || "mcq");

  return (
    <div className="p-4 space-y-6">
      <div className="text-xs text-gray-500">
        ID: {mistake.id} / type: {type}
      </div>

      {type === "mcq" && (
        <MCQView
          text={mistake.text}
          options={mistake.options || mistake.choices || []}
          answer={mistake.answer}
          judge={judge}
        />
      )}

      {type === "text" && (
        <TextView text={mistake.text} answer={mistake.answer} judge={judge} />
      )}
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

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
          text={mistake.text}
          tokens={mistake.tokens || []}
          answer={mistake.answer}
          judge={judge}
        />
      )}

      {type === "group" && (
        <GroupView
<<<<<<< HEAD
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
=======
          text={mistake.text}
          tokens={mistake.tokens || []}
          groups={mistake.groups || []}
          answer={mistake.answer || {}}
          judge={judge}
        />
      )}

      {!["mcq", "text", "sequence", "group"].includes(type) && (
        <div>
          <p className="text-lg font-semibold mb-2">{mistake.text}</p>
          <p className="text-sm text-gray-500">未対応タイプ: {type}</p>
        </div>
      )}

      {result && (
        <div className="font-bold">
          {result}
          <div className="mt-4 space-x-2">
            <button
              onClick={nextFromSession}
              className="px-3 py-2 rounded bg-purple-600 text-white"
            >
              次の問題へ
            </button>
            <button
              onClick={() => navigate("/review/mistakes")}
              className="px-3 py-2 rounded border"
            >
              Mistakes一覧へ戻る
            </button>
          </div>
        </div>
      )}
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
    </div>
  );
}
