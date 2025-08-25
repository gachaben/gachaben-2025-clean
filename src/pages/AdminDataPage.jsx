import React, { useEffect, useState } from "react";
import {
  collection, getDocs, orderBy, query, limit, where,
} from "firebase/firestore";
import { db } from "@/fbkit";

// 陦ｨ遉ｺ逕ｨ
function toDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
// CSV 繝繧ｦ繝ｳ繝ｭ繝ｼ繝・
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

// 蜈･蜉帛､(datetime-local) 竊・Date or null
const parseLocal = (s) => (s ? new Date(s) : null);

export default function AdminDataPage() {
  const [battles, setBattles] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 蜈ｱ騾夲ｼ壽悄髢薙ヵ繧｣繝ｫ繧ｿ・医Ο繝ｼ繧ｫ繝ｫ譎る俣・・
  const [from, setFrom] = useState("");         // "2025-08-14T00:00"
  const [to, setTo] = useState("");             // "2025-08-14T23:59"
  // mistakes 縺ｯ updatedAt 蜆ｪ蜈医ょｿ・ｦ√↑繧牙・譖ｿ蜿ｯ閭ｽ
  const [mistakesField] = useState("updatedAt"); // "updatedAt" | "createdAt"

  const fetchAll = async () => {
    setLoading(true);
    try {
      const fromD = parseLocal(from);
      const toD = parseLocal(to);

      // ---- battles: createdAt 蝓ｺ貅・----
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
        // 繧､繝ｳ繝・ャ繧ｯ繧ｹ譛ｪ菴懈・縺ｪ縺ｩ縺ｧ螟ｱ謨・竊・繝輔Ν蜿門ｾ励＠縺ｦ繧ｯ繝ｩ繧､繧｢繝ｳ繝亥・縺ｧ譛滄俣邨槭ｊ
        const bSnap = await getDocs(collection(db, "battles"));
        const all = bSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setBattles(all.filter((r) => {
          const t = r.createdAt?.toDate ? r.createdAt.toDate() : r.createdAt ? new Date(r.createdAt) : null;
          if (!t) return true; // 譌･莉倥↑縺励・陦ｨ遉ｺ
          return (!fromD || t >= fromD) && (!toD || t <= toD);
        }).sort((a,b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)).slice(0,200));
      }

      // ---- mistakes: updatedAt 蜆ｪ蜈・竊・縺繧√↑繧・createdAt, 縺輔ｉ縺ｫ蜈ｨ莉ｶ ----
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
          // 譛邨ゅヵ繧ｩ繝ｼ繝ｫ繝舌ャ繧ｯ・壼・莉ｶ蜿門ｾ冷・繧ｯ繝ｩ繧､繧｢繝ｳ繝医〒譛滄俣邨槭ｊ
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

  useEffect(() => { fetchAll(); /* 蛻晏屓 */ }, []);
  const onApply = () => fetchAll();

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Admin Data Viewer</h1>

      {/* 譛滄俣繝輔ぅ繝ｫ繧ｿ */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <label>譛滄俣 From:
          <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <label>To:
          <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} style={{ marginLeft: 6 }} />
        </label>
        <button onClick={onApply} disabled={loading} style={{ padding: "8px 12px", borderRadius: 8 }}>
          {loading ? "譖ｴ譁ｰ荳ｭ..." : "縺薙・譚｡莉ｶ縺ｧ蜀崎ｪｭ縺ｿ霎ｼ縺ｿ"}
        </button>
        <button onClick={() => { setFrom(""); setTo(""); setTimeout(fetchAll, 0); }} style={{ padding: "8px 12px", borderRadius: 8 }}>
          繝輔ぅ繝ｫ繧ｿ隗｣髯､
        </button>
      </div>

      {/* battles */}
      <h2 style={{ marginTop: 8 }}>
        battles・・reatedAt 蝓ｺ貅・/ 譛螟ｧ200莉ｶ・・
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
        mistakes・・mistakesField} 蝓ｺ貅・/ 譛螟ｧ500莉ｶ・・
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
