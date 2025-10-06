// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/fbkit";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 簡易ビュー：MCQ
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

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">エラー: {error}</div>;
  if (!mistake) return <div className="p-4">問題データがありません</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="text-xs text-gray-500">ID: {mistake.id}</div>

      {mistake.type === "mcq" ? (
        <MCQView
          text={mistake.text}
          options={mistake.options || mistake.choices || []}
          answer={mistake.answer}
          judge={judge}
        />
      ) : (
        <div>
          <p className="text-lg font-semibold mb-2">{mistake.text}</p>
          <p className="text-sm text-gray-500">
            ※ type {mistake.type} は未対応です
          </p>
        </div>
      )}

      {result && <div className="font-bold">{result}</div>}

      <button
        onClick={() => navigate("/review/mistakes")}
        className="px-3 py-2 rounded border mt-4"
      >
        Mistakes一覧へ戻る
      </button>
    </div>
  );
}
