// src/pages/ReviewPage.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getMistakes } from "../lib/getMistakes";
import { useNavigate, Link } from "react-router-dom";

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await getMistakes(uid);
        setMistakes(data);
      } catch (e) {
        console.error("[review] load error:", e);
        setError(e?.message || "読み込みに失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-4">復習モード</h1>

      {mistakes.length === 0 ? (
        <p>間違えた問題はありません 🎉</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mistakes.map((m) => (
            <li key={m.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <div>問題ID: {m.questionId}</div>
              <div>あなたの選択: {m.choice}</div>
              <div>正解: {m.correct}</div>
              <button
                onClick={() => navigate(`/review/play/${encodeURIComponent(m.id)}`)}
                style={{ marginTop: 8, padding: "6px 10px" }}
              >
                この問題で復習する
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 16 }}>
        <Link to="/login">ログインへ/変更へ</Link>
      </div>
    </div>
  );
}
