// src/pages/HistoryPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getFirestoreDb } from "@/firebase";
const db = getFirestoreDb();


/** Firestore Timestamp または null を "YYYY-MM-DD HH:mm" へ */
function fmt(ts) {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return "-";
  }
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErr(null);
      try {
        // createdAt 降順（新しい順）で取得
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        if (!alive) return;

        const list = snap.docs.map((d) => {
          const data = d.data() || {};
          return {
            id: d.id,
            displayName: data.displayName ?? "",
            createdAt: data.createdAt ?? null,
          };
        });
        setRows(list);
      } catch (e) {
        console.error("[FBKIT] users list error", e); // ← 一時ログ
        setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const body = useMemo(() => {
    if (loading) return <p className="text-sm text-gray-500">読み込み中…</p>;
    if (err)
      return (
        <p className="text-sm text-red-600">
          取得に失敗しました。コンソールログをご確認ください。
        </p>
      );
    if (!rows.length)
      return <p className="text-sm text-gray-500">users がありません。</p>;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-semibold border-b">id</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b">displayName</th>
              <th className="px-3 py-2 text-left text-xs font-semibold border-b">createdAt</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 text-sm align-top border-b break-all">{r.id}</td>
                <td className="px-3 py-2 text-sm align-top border-b">{r.displayName || "-"}</td>
                <td className="px-3 py-2 text-sm align-top border-b">
                  {fmt(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [loading, err, rows]);

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg font-bold mb-4">Users History</h1>
      {body}
    </div>
  );
}
