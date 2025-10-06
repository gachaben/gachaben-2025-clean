// src/pages/ReviewSessionStart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestoreDb, getFirebaseAuth } from "@/fbkit";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export default function ReviewSessionStart() {
  const [mistakes, setMistakes] = useState([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMistakes = async () => {
      const db = getFirestoreDb();
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) {
        setMistakes([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "mistakes"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMistakes(rows);
      setLoading(false);
    };
    fetchMistakes();
  }, []);

  const startSession = () => {
    if (mistakes.length === 0) return alert("復習する問題がありません");

    // ランダムに選択
    const shuffled = [...mistakes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // localStorage にセッション保存
    localStorage.setItem("reviewSession", JSON.stringify(selected.map((m) => m.id)));

    // 1問目へ遷移
    navigate(`/review/play/${selected[0].id}`);
  };

  if (loading) return <div className="p-4">読み込み中…</div>;

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">連続復習セッション開始</h1>

      <div className="space-y-3">
        <label className="block">
          出題数を選択:
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value={3}>3問</option>
            <option value={5}>5問</option>
            <option value={10}>10問</option>
          </select>
        </label>
      </div>

      <button
        onClick={startSession}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        セッション開始
      </button>
    </div>
  );
}
