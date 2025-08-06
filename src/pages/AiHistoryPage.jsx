// src/pages/AiHistoryPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const AiHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "aiProblemLogs"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(logs);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📘 過去の診断履歴</h2>
      {loading ? (
        <p>読み込み中...</p>
      ) : history.length === 0 ? (
        <p>履歴がありません。</p>
      ) : (
        <ul className="space-y-4">
          {history.map((log) => (
            <li key={log.id} className="border p-4 rounded">
              <p>📅 {log.createdAt?.toDate().toLocaleString()}</p>
              <p>🧒 学年：{log.grade}</p>
              <p>📚 教科：{log.subject}</p>
              <p>📖 単元：{log.unit}</p>
              <p>🌀 トピック：{log.topic}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AiHistoryPage;
