// src/pages/ReviewMistakesPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

function fmt(ts) {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString("ja-JP");
  } catch {
    return "-";
  }
}

// 互換: status / isReviewed / reviewStatus から「未復習か」を求める
function isUnreviewed(m) {
  if (typeof m?.status === "string") return m.status === "open";
  if (typeof m?.isReviewed === "boolean") return !m.isReviewed;
  return true; // フィールドが無い古いデータは一旦「未復習」とみなす
}

// 互換: 集計用の状態名を返す "unreviewed" | "got" | "retry" | "reviewed"
function normalizeReviewState(m) {
  if (typeof m?.status === "string") {
    return m.status === "open" ? "unreviewed" : "reviewed";
  }
  if (m?.isReviewed) {
    if (m?.reviewStatus === "got") return "got";
    if (m?.reviewStatus === "retry") return "retry";
    return "reviewed";
  }
  return "unreviewed";
}

export default function ReviewMistakesPage() {
  const navigate = useNavigate();
  const [uid, setUid] = useState(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUid(null);
        setItems([]);
        setLoading(false);
        return;
      }
      setUid(u.uid);


      // Mistakes購読
      const q = query(
        collection(db, "mistakes"),
        where("userId", "==", u.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const un = onSnapshot(q, (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
      return un;
    });
    return () => unsub();
  }, []);


  if (loading) return <div className="p-4">読み込み中…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Mistakes一覧</h1>

      {items.length === 0 && (
        <div className="p-4 border rounded bg-gray-50 text-gray-600">
          復習すべき問題はありません 🎉
        </div>

      )}

      {items.map((m) => (
        <div
          key={m.id}
          className="p-4 border rounded bg-white shadow-sm space-y-2"
        >
          <div className="text-sm text-gray-500">
            作成: {fmt(m.createdAt)} ／ 状態:{" "}
            {m.reviewStatus || "未復習"}
          </div>
          <div className="font-semibold">{m.text || m.question}</div>
          <button
            onClick={() => navigate(`/review/play/${m.id}`)}
            className="mt-2 px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            この問題で復習する
          </button>
        </div>
      ))}
    </div>
  );
}
