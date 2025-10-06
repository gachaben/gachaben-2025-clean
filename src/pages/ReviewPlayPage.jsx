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
  const [picked, setPicked] = useState(null);

  const confirm = () => {
    if (picked == null) return;
    const ok = options[picked] === answer;
    judge(ok, options[picked]);
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
        確認
      </button>
    </div>
  );
}

/* -------------------- Text 入力問題 -------------------- */
function TextView({ text, answer, judge }) {
  const [val, setVal] = useState("");

  const confirm = () => {
    if (!val) return;
    const ok = String(val).trim() === String(answer).trim();
    judge(ok, val);
  };

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold mb-2">{text}</div>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="px-3 py-2 rounded border w-full"
        placeholder="ここに入力"
      />
      <button
        onClick={confirm}
        disabled={!val}
        className="px-4 py-2 rounded bg-emerald-600 text-white mt-2 disabled:opacity-50"
      >
        確認
      </button>
    </div>
  );
}

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

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "mistakes", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("問題が見つかりません");
        setMistake({ id: snap.id, ...snap.data() });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
    </div>
  );
}
