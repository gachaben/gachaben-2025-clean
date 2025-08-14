import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebase";

function toDate(ts) {
  if (!ts) return "";
  // Firestore Timestamp or string fallback
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function AdminDataPage() {
  const [battles, setBattles] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
  setLoading(true);
  try {
    // battles は今まで通り
    const bq = query(collection(db, "battles"), orderBy("createdAt", "desc"), limit(50));
    const bSnap = await getDocs(bq);
    setBattles(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    // mistakes は堅い順にフォールバック（順に試す）
    let mDocs = [];
    let lastErr = null;

    // 1) まずは素直に全件（並び替えなし）
    try {
      const mSnap = await getDocs(collection(db, "mistakes"));
      mDocs = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) { lastErr = e; }

    // 2) 空っぽなら createdAt 降順
    if (mDocs.length === 0) {
      try {
        const mq = query(collection(db, "mistakes"), orderBy("createdAt", "desc"), limit(100));
        const mSnap = await getDocs(mq);
        mDocs = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) { lastErr = e; }
    }

    // 3) それでも空なら updatedAt 降順（あなたの保存コードが updatedAt を使う想定）
    if (mDocs.length === 0) {
      try {
        const mq = query(collection(db, "mistakes"), orderBy("updatedAt", "desc"), limit(100));
        const mSnap = await getDocs(mq);
        mDocs = mSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) { lastErr = e; }
    }

    setMistakes(mDocs);

    // デバッグログ（必要なら残す）
    console.log("[admin] battles:", bSnap.size, "mistakes:", mDocs.length, { lastErr });
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchAll(); }, []);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Admin Data Viewer</h1>
      <button onClick={fetchAll} disabled={loading} style={{ padding: "8px 12px", borderRadius: 8 }}>
        {loading ? "更新中..." : "再読み込み"}
      </button>

      <h2 style={{ marginTop: 24 }}>battles（最新50件）</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>id</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>userId</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>roundsPlayed</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>winner</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>createdAt</th>
            </tr>
          </thead>
          <tbody>
            {battles.map(row => (
              <tr key={row.id}>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.id}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.userId ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.roundsPlayed ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.winner ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{toDate(row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 24 }}>mistakes（最新100件）</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>id</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>battleId</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>round</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>choice</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>correct</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>difficulty</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>updatedAt</th>
            </tr>
          </thead>
          <tbody>
            {mistakes.map(row => (
              <tr key={row.id}>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.id}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.battleId ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.round ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.choice ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{String(row.correct ?? "")}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{row.difficulty ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #eee" }}>{toDate(row.updatedAt ?? row.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
