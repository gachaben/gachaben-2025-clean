// src/pages/AiHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export default function AiHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "aiProblemLogs"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        const logs = snapshot.docs.map((d) => {
          const data = d.data() || {};
          // createdAt は Timestamp の可能性あり。安全に整形
          const created =
            (data.createdAt?.toDate?.() ?? null) ||
            (typeof data.createdAt === "number"
              ? new Date(data.createdAt)
              : null);

        return {
            id: d.id,
            ...data,
            createdAtDate: created,
          };
        });

        setHistory(logs);
      } catch (e) {
        console.error("fetchHistory error:", e);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">📘 過去の診断履歴</h2>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📘 過去の診断履歴</h2>

      {history.length === 0 ? (
        <p>履歴がありません。</p>
      ) : (
        <ul className="space-y-4">
          {history.map((log) => (
            <li key={log.id} className="border p-4 rounded bg-white">
              <p>📅 {log.createdAtDate ? log.createdAtDate.toLocaleString() : "日時不明"}</p>
              <p>🏫 学年：{log.grade ?? "-"}</p>
              <p>📚 教科：{log.subject ?? "-"}</p>
              <p>📖 単元：{log.unit ?? "-"}</p>
              <p>🌀 トピック：{log.topic ?? "-"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
