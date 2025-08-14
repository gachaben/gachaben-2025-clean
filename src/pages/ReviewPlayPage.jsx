// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default function ReviewPlayPage() {
  const { mistakeId } = useParams();
  const [mistake, setMistake] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "mistakes", mistakeId));
        setMistake(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [mistakeId]);

  const resolveAndRemove = async () => {
    await deleteDoc(doc(db, "mistakes", mistakeId));
    navigate("/review");
  };

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;

  if (!mistake) {
    return (
      <div style={{ padding: 16 }}>
        データが見つかりませんでした。<Link to="/review">← 戻る</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>復習プレイ</h1>
      <p>問題ID: {mistake.questionId}</p>
      <p>あなたの選択: {mistake.choice}</p>
      <p>正解: {mistake.correct}</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={resolveAndRemove} style={{ marginRight: 8 }}>
          正解したので削除
        </button>
        <Link to="/review">やっぱり戻る</Link>
      </div>
    </div>
  );
}
