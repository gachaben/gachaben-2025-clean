// src/pages/ReviewPage.jsx
import React, { useEffect, useState } from "react";
import { getMistakes } from "../lib/getMistakes";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) {
        setMistakes([]);
        setLoading(false);
        return;
      }
      try {
        const data = await getMistakes(u.uid);
        setMistakes(data);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <p style={{ padding: 16 }}>読み込み中...</p>;

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <h1>復習モード</h1>
        <p>復習するにはログインしてください。</p>
        <p><Link to="/login">ログインページへ</Link></p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>復習モード</h1>
      {mistakes.length === 0 ? (
        <p>間違えた問題はまだありません。</p>
      ) : (
        <ul>
          {mistakes.map((m) => (
            <li key={m.id}>
              {m.questionText
                ? `${m.questionText} (${m.questionId})`
                : `問題ID: ${m.questionId}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
