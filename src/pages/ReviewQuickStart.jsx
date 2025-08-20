// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db, ensureSignedIn } from "../firebase";

export default function ReviewQuickStart() {
  const [uid, setUid] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 匿名サインインを保証（ここで getAuth は使わない。ensureSignedIn を使う）
  useEffect(() => {
    (async () => {
      try {
        const u = await ensureSignedIn();
        setUid(u.uid);
      } catch (e) {
        console.error(e);
        setErr("サインインに失敗しました");
        setLoading(false);
      }
    })();
  }, []);

  // mistakes を購読
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error(e);
        setErr(e?.message || "読み込みエラー");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>エラー: {err}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 className="text-lg font-bold mb-2">復習モード（QuickStart）</h2>
      {rows.length === 0 ? (
        <div>復習項目はまだありません</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {rows.map(m => (
            <li key={m.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{m.text}</div>
              <div>あなたの選択: {m.picked}</div>
              <div>正解: {m.answer}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
