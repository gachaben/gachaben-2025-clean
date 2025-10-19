// ------------------------------------------------------
// src/pages/ReviewMistakesPage.jsx（2025対応版・Firebase v9統一）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/fbkit"; // ✅ ここで統一
import { Link } from "react-router-dom";

export default function ReviewMistakesPage() {
  const [mistakes, setMistakes] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [uid]);

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-2">間違い問題リスト</h1>
      {mistakes.length === 0 ? (
        <div>間違い問題はまだありません 🎉</div>
      ) : (
        <ul>
          {mistakes.map((m) => (
            <li key={m.id} style={{ marginBottom: 8 }}>
              <Link to={`/review/play/${m.id}`}>{m.text}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
