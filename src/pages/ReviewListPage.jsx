// src/pages/ReviewListPage.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/fbkit";
import {
  collection, getDocs, query, where, orderBy, limit
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ReviewListPage() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? "guest";
      const qref = query(
        collection(db, "mistakes"),
        where("userId", "==", uid),
        where("status", "==", "open"),
        orderBy("lastWrongAt", "desc"),
        limit(50)
      );
      const snap = await getDocs(qref);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setReady(true);
    });
    return () => unsub();
  }, []);

  if (!ready) return <div>読み込み中...</div>;
  return (
    <div style={{ padding: 16 }}>
      <h2>復習一覧</h2>
      {items.length === 0 ? (
        <p>復習対象はありません 🎉</p>
      ) : (
        <>
          <p>件数: {items.length}</p>
          <ul style={{ lineHeight: 1.8 }}>
            {items.map(m => (
              <li key={m.id}>
                <span style={{ color: "#555" }}>[{m.times ?? 1}回ミス]</span>{" "}
                {m.question}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/review/play", { state: { ids: items.map(i=>i.id) } })}
            style={{ marginTop: 12 }}
          >
            こ�E一覧で復習を開姁E
          </button>
        </>
      )}
    </div>
  );
}
