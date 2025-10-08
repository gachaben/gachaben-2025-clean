// src/pages/ReviewMistakesPage.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/fbkit";
import { Link } from "react-router-dom";

export default function ReviewMistakesPage() {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(getAuth(), (u) => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  if (loading) return <div className="p-4">読み込み中…</div>;
  if (!mistakes.length) return <div className="p-4">間違い記録はまだありません。</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">❌ 間違い一覧</h2>
      <ul className="space-y-2">
        {mistakes.map((m) => (
          <li
            key={m.id}
            className="border rounded-lg p-3 bg-white shadow-sm hover:bg-blue-50 transition"
          >
            <div className="text-sm text-gray-600">{m.subject}・{m.grade}</div>
            <div className="font-semibold">{m.question}</div>
            <div className="text-xs text-gray-400">{m.createdAt?.toDate?.().toLocaleString?.()}</div>
            <Link
              to={`/review/play/${m.id}`}
              className="inline-block mt-2 text-blue-500 underline text-sm"
            >
              ▶ この問題を復習
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
