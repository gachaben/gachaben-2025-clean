// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default function ReviewPlayPage() {
  // どちらの名前でも受け取れるよう保険（:id が基本）
  const { id: idParam, mistakeId } = useParams();
  const id = idParam ?? mistakeId;

  const [mistake, setMistake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // URL直打ちの「:id」や undefined をはじく
    if (!id || id.startsWith(":")) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "mistakes", id));
        setMistake(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const resolveAndRemove = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, "mistakes", id));
      navigate("/review"); // ← 一覧へ戻る（onSnapshotで即消える）
      // navigate(-1); でもOK（履歴で戻る派ならこちら）
    } catch (e) {
      console.error("[review] delete error:", e);
      alert("削除に失敗しました。Console を確認してください。");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;

  if (!id || id.startsWith(":")) {
    return (
      <div style={{ padding: 16 }}>
        正しいURLではありません。<Link to="/review">← 一覧へ</Link>
      </div>
    );
  }

  if (!mistake) {
    return (
      <div style={{ padding: 16 }}>
        データが見つかりませんでした。<Link to="/review">← 戻る</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-2">復習プレイ</h1>
      <p>問題ID: {mistake.questionId}</p>
      <p>あなたの選択: {mistake.choice}</p>
      <p>正解: {mistake.correct}</p>

      <div style={{ marginTop: 12 }}>
        <button onClick={resolveAndRemove} disabled={saving} style={{ marginRight: 8 }}>
          {saving ? "削除中…" : "正解したので削除"}
        </button>
        <Link to="/review">やっぱり戻る</Link>
      </div>
    </div>
  );
}
