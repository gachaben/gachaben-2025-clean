// src/pages/ReviewPage.jsx
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

export default function ReviewPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // いまのUID（表示＆クエリ用）
  const uid = getAuth().currentUser?.uid;

  // リアルタイム購読
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error("[review] onSnapshot error:", e);
        setError(e?.message || "読み込みに失敗しました");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  // デバッグ用：1件追加
  const addTestMistake = async () => {
    if (!uid) return alert("ログインしていません");
    await addDoc(collection(db, "mistakes"), {
      uid,
      questionId: "q-test",
      choice: "A",
      correct: "B",
      createdAt: serverTimestamp(),
    });
  };

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-2">復習モード</h1>

      {/* UIDの可視化（動作確認用。あとで消してOK） */}
      {uid ? (
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          uid: {uid}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#b00", marginBottom: 8 }}>
          未ログインです
        </div>
      )}

      {/* デバッグ追加ボタン（開発中だけ使う） */}
      {uid && (
        <button onClick={addTestMistake} style={{ marginBottom: 12 }}>
          （デバッグ）テスト問題を1件追加
        </button>
      )}

      {mistakes.length === 0 ? (
        <p>間違えた問題はありません 🎉</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mistakes.map((m) => (
            <li
              key={m.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <div>問題ID: {m.questionId}</div>
              <div>あなたの選択: {m.choice}</div>
              <div>正解: {m.correct}</div>
              <button
                onClick={() =>
                  navigate(`/review/play/${encodeURIComponent(m.id)}`)
                }
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
