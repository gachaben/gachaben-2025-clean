// src/pages/ReviewListPage.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "@/fbkit";
import { db } from "@/fbkit";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ReviewListPage() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setItems([]);
        setReady(true);
        return;
      }

      try {
        const qref = query(
          collection(db, "mistakes"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const snap = await getDocs(qref);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
      } catch (e) {
        console.error("failed to load mistakes:", e);
        setItems([]);
      } finally {
        setReady(true);
      }
    });
    return () => unsub();
  }, []);

  if (!ready) return <div style={{ padding: 16 }}>読み込み中...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>復習リスト</h2>
      {items.length === 0 && <p style={{ color: "#999" }}>復習すべき問題はありません</p>}

      <ul style={{ marginTop: 16 }}>
        {items.map((m) => (
          <li key={m.id} style={{ marginBottom: 12 }}>
            <div>
              <strong>{m.question}</strong>
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {m.subject || "未分類"} / {m.grade || "?"}年
            </div>
            <button
              style={{
                marginTop: 4,
                padding: "4px 8px",
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
              onClick={() => navigate(`/review/play/${m.id}`)}
            >
              解く
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
