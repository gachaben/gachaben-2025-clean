import React, { useEffect, useState } from "react";
import {
  collection, getDocs, orderBy, query, limit, where,
} from "firebase/firestore";
import { db } from "../firebase";

// 表示用
function toDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
// CSV ダウンロード
function downloadCsv(filename, rows, columns) {
  const esc = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const header = columns.map((c) => c.label).join(",");
  const body = rows.map(r => columns.map(c => esc(c.get(r))).join(",")).join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// 入力値(datetime-local) → Date or null
const parseLocal = (s) => (s ? new Date(s) : null);

export default function AdminDataPage() {
  const [battles, setBattles] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 共通：期間フィルタ（ローカル時間）
  const [from, setFrom] = useState("");         // "2025-08-14T00:00"
  const [to, setTo] = useState("");             // "2025-08-14T23:59"
  // mistakes は updatedAt 優先。必要なら切替可能
  const [mistakesField] = useState("updatedAt"); // "updatedAt" | "createdAt"

  const fetchAll = async () => {
    setLoading(true);
    try {
      const fromD = parseLocal(from);
      const toD = parseLocal(to);

      // ---- battles: createdAt 基準 ----
      try {
        const cons = [];
        if (fromD) cons.push(where("createdAt", ">=", fromD));
        if (toD)   cons.push(where("createdAt", "<=", toD));
        cons.push(orderBy("createdAt", "desc"));
        cons.push(limit(200));
        const bq = query(collection(db, "battles"), ...cons);
        const bSnap = await getDocs(bq);
        setBattles(bSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // インデックス未作成などで失敗 → フル取得してクライアント側で期間絞り
        const bSnap = await getDocs(collection(db, "battles"));
        const all = bSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBattles(all.filter((r) => {
          const t = r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt ? new Date(r.createdAt) : null;
          if (!t) return true; // 日付なしは表示
          return (!fromD || t >= fromD) && (!toD || t <= toD);
        }).sort((a,b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0,200));
      }

      // ---- mistakes: updatedAt 優先 → だめなら createdAt, さらに全件 ----
      const tryFetchMistakes = async (field) => {
        const cons = [];
        if (fromD) cons.push(where(field, ">=", fromD));
        if (toD)   cons.push(where(field, "<=", toD));
        cons.push(orderBy(field, "desc"));
        cons.push(limit(500));
        const mq = query(collection(db, "mistakes"), ...cons);
        const mSnap = await getDocs(mq);
        return mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      };

      let mDocs = [];
      try {
        mDocs = await tryFetchMistakes(mistakesField);
      } catch {
        try {
          mDocs = await tryFetchMistakes("createdAt");
        } catch {
          // 最終フォールバック：全件取得→クライアントで期間絞り
          const mSnap = await getDocs(collection(db, "mistakes"));
          const all = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
          mDocs = all.filter((r) => {
            const base = r.updatedAt ?? r.createdAt;
            const t = base?.toDate ? base.toDate() : base ? new Date(base) : null;
            if (!t) return true;
            return (!fromD || t >= fromD) && (!toD || t <= toD);
          }).sort((a,b) => {
            const ta = (a.updatedAt ?? a.createdAt)?.seconds ?? 0;
            const tb = (b.updatedAt ?? b.createdAt)?.seconds ?? 0;
            return tb - ta;
          }).slice(0, 500);
        }
      }
      setMistakes(mDocs);
      console.log("[admin] fetched:", { battles: battles.length, mistakes: mDocs.length });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* 初回 */ }, []);
  const onApply = () => fetchAll();

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Admin Data Viewer</h1>

      {/* 期間フィルタ */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <label>期間 From:
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <label>To:
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <button onClick={onApply} disabled={loading} style={{ padding: "8px 12px", borderRadius: 8 }}>
          {loading ? "更新中..." : "この条件で再読み込み"}
        </button>
        <button onClick={() => { setFrom(""); setTo(""); setTimeout(fetchAll, 0); }} style={{ padding: "8px 12px", borderRadius: 8 }}>
          フィルタ解除
        </button>
      </div>

      {/* battles */}
      <h2 style={{ marginTop: 8 }}>
        battles（createdAt 基準 / 最大200件）
        <button
          style={{ marginLeft: 8, padding: "4px 8px", borderRadius: 6 }}
          onClick={() =>
            downloadCsv(
              "battles.csv",
              battles,
              [
                { label: "id",           get: (r) => r.id },
                { label: "userId",       get: (r) => r.userId ?? "" },
                { label: "roundsPlayed", get: (r) => r.roundsPlayed ?? "" },
                { label: "winner",       get: (r) => r.winner ?? "" },
                { label: "createdAt",    get: (r) =>
                  (r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : (r.createdAt || "")) },
              ]
            )
          }
        >CSV</button>
      </h2>
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
            {battles.map((row) => (
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

      {/* mistakes */}
      <h2 style={{ marginTop: 24 }}>
        mistakes（{mistakesField} 基準 / 最大500件）
        <button
          style={{ marginLeft: 8, padding: "4px 8px", borderRadius: 6 }}
          onClick={() =>
            downloadCsv(
              "mistakes.csv",
              mistakes,
              [
                { label: "id",         get: (r) => r.id },
                { label: "battleId",   get: (r) => r.battleId ?? "" },
                { label: "round",      get: (r) => r.round ?? "" },
                { label: "choice",     get: (r) => r.choice ?? "" },
                { label: "correct",    get: (r) => r.correct ?? "" },
                { label: "difficulty", get: (r) => r.difficulty ?? "" },
                { label: "updatedAt",  get: (r) =>
                  (r.updatedAt?.toDate ? r.updatedAt.toDate().toISOString()
                   : r.createdAt?.toDate ? r.createdAt.toDate().toISOString()
                   : (r.updatedAt || r.createdAt || "")) },
              ]
            )
          }
        >CSV</button>
      </h2>
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
            {mistakes.map((row) => (
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
