// src/pages/HistoryPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  onSnapshot,
  startAt,
  endAt,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { getFirestoreDb } from "@/fbkit";
const db = getFirestoreDb();

/** Firestore Timestamp → "YYYY-MM-DD HH:mm" */
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

// CSV ダウンロード（今表示中の rows を出力）
function downloadCsv(rows) {
  const header = ["id", "displayName", "email", "role", "createdAt", "lastLoginAt"];
  const lines = [header.join(",")];
  rows.forEach((r) => {
    const vals = [
      r.id,
      (r.displayName ?? "").replaceAll(",", " "),
      (r.email ?? "").replaceAll(",", " "),
      (r.role ?? "").replaceAll(",", " "),
      fmt(r.createdAt),
      fmt(r.lastLoginAt),
    ];
    lines.push(vals.join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `users_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [rows, setRows] = useState([]);

  // 検索とリアルタイム
  const [search, setSearch] = useState("");
  const [live, setLive] = useState(false); // 検索時は強制OFF

  // ページング
  const [pageSize, setPageSize] = useState(20);
  const firstDocRef = useRef(null);
  const lastDocRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [pageStack, setPageStack] = useState([]);

  // ------- 通常（非検索）初回ロード or live切替 or pageSize変更 -------
  useEffect(() => {
    if (search.trim()) return; // 検索中はここを使わない

    let unsubscribe = null;
    async function runOnce() {
      setLoading(true);
      setErr(null);
      try {
        const q = query(
          collection(db, "users"),
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
        if (live) {
          unsubscribe = onSnapshot(
            q,
            (snap) => {
              const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
              setRows(list);
              firstDocRef.current = snap.docs[0] ?? null;
              lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
              setCanPrev(false);
              setCanNext(snap.docs.length === pageSize);
              setPageStack([]);
              setLoading(false);
            },
            (e) => {
              console.error("[FBKIT] users list error (live)", e);
              setErr(e);
              setLoading(false);
            }
          );
        } else {
          const snap = await getDocs(q);
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
          setRows(list);
          firstDocRef.current = snap.docs[0] ?? null;
          lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
          setCanPrev(false);
          setCanNext(snap.docs.length === pageSize);
          setPageStack([]);
        }
      } catch (e) {
        console.error("[FBKIT] users list error (first)", e);
        setErr(e);
      } finally {
        if (!live) setLoading(false);
      }
    }
    runOnce();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pageSize, live, search]); // searchが空に戻ったら通常ロード

  // ------- サーバーサイド検索（前方一致: displayNameLower） -------
  useEffect(() => {
    const qStr = search.trim().toLowerCase();
    if (!qStr) return; // 検索していない
    setLive(false); // 検索中はlive無効（リッスンが重くなる）

    let timer = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        // まず displayNameLower を優先
        const base = collection(db, "users");
        let qy = query(
          base,
          orderBy("displayNameLower"),
          startAt(qStr),
          endAt(qStr + "\uf8ff"),
          limit(50)
        );
        try {
          const snap = await getDocs(qy);
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
          setRows(list);
          // 検索時はシンプルにページングOFF
          firstDocRef.current = null;
          lastDocRef.current = null;
          setCanPrev(false);
          setCanNext(false);
        } catch (idxErr) {
          // displayNameLower が無い場合のフォールバック（ケース感度あり）
          console.warn("[FBKIT] fallback to displayName (no displayNameLower / need index?)", idxErr);
          qy = query(
            base,
            orderBy("displayName"),
            startAt(search.trim()),
            endAt(search.trim() + "\uf8ff"),
            limit(50)
          );
          const snap = await getDocs(qy);
          const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
          setRows(list);
          setCanPrev(false);
          setCanNext(false);
        }
      } catch (e) {
        console.error("[FBKIT] users search error", e);
        setErr(e);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms デバウンス

    return () => clearTimeout(timer);
  }, [search]);

  // ------- 次ページ/前ページ（非検索のみ） -------
  async function loadNext() {
    if (search.trim() || !lastDocRef.current) return;
    setLoading(true);
    setErr(null);
    try {
      const qy = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(lastDocRef.current),
        limit(pageSize)
      );
      const snap = await getDocs(qy);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      if (list.length) setPageStack((st) => [...st, firstDocRef.current]);
      setRows(list);
      firstDocRef.current = snap.docs[0] ?? null;
      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
      setCanPrev(true);
      setCanNext(snap.docs.length === pageSize);
    } catch (e) {
      console.error("[FBKIT] users list error (next)", e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadPrev() {
    if (search.trim() || !pageStack.length) return;
    setLoading(true);
    setErr(null);
    try {
      const anchor = pageStack[pageStack.length - 1];
      const qy = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        endBefore(anchor),
        limitToLast(pageSize)
      );
      const snap = await getDocs(qy);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
      setRows(list);
      firstDocRef.current = snap.docs[0] ?? null;
      lastDocRef.current = snap.docs[snap.docs.length - 1] ?? null;
      const newStack = [...pageStack];
      newStack.pop();
      setPageStack(newStack);
      setCanPrev(newStack.length > 0);
      setCanNext(true);
    } catch (e) {
      console.error("[FBKIT] users list error (prev)", e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  }

  // クライアント側の最終フィルタは撤廃（検索はサーバー側で実施）
  const displayed = rows;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-lg font-bold">Users History</h1>

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">件数</label>
          <select
            className="border px-2 py-1 text-sm rounded"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            disabled={!!search.trim()}
            title={search.trim() ? "検索中は固定" : ""}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="displayName 前方一致（例: ta → tanaka, taro…）"
          className="border px-3 py-1 text-sm rounded w-full md:w-96"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm">Live更新</label>
          <input
            type="checkbox"
            checked={live && !search.trim()}
            onChange={(e) => setLive(e.target.checked)}
            disabled={!!search.trim()}
            title={search.trim() ? "検索中はOFF固定" : ""}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => downloadCsv(displayed)}
            className="border px-3 py-1 text-sm rounded hover:bg-gray-50"
          >
            CSV エクスポート
          </button>
          <button
            onClick={loadPrev}
            disabled={!canPrev || loading || !!search.trim()}
            className={`border px-3 py-1 text-sm rounded ${!canPrev || loading || search.trim() ? "opacity-50" : "hover:bg-gray-50"}`}
          >
            ← 前
          </button>
          <button
            onClick={loadNext}
            disabled={!canNext || loading || !!search.trim()}
            className={`border px-3 py-1 text-sm rounded ${!canNext || loading || search.trim() ? "opacity-50" : "hover:bg-gray-50"}`}
          >
            次 →
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-500">読み込み中…</p>}
      {err && (
        <p className="text-sm text-red-600">
          取得に失敗しました。コンソールログをご確認ください。
        </p>
      )}
      {!loading && !err && !displayed.length && (
        <p className="text-sm text-gray-500">該当ユーザーがありません。</p>
      )}

      {!loading && !err && displayed.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">id</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">displayName</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">email</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">role</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">createdAt</th>
                <th className="px-3 py-2 text-left text-xs font-semibold border-b">lastLoginAt</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 text-sm align-top border-b break-all">
                    <Link to={`/users/${r.id}`} className="text-blue-600 hover:underline">{r.id}</Link>
                  </td>
                  <td className="px-3 py-2 text-sm align-top border-b">
                    <Link to={`/users/${r.id}`} className="text-blue-600 hover:underline">
                      {r.displayName || "-"}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm align-top border-b">{r.email || "-"}</td>
                  <td className="px-3 py-2 text-sm align-top border-b">{r.role || "-"}</td>
                  <td className="px-3 py-2 text-sm align-top border-b">{fmt(r.createdAt)}</td>
                  <td className="px-3 py-2 text-sm align-top border-b">{fmt(r.lastLoginAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-xs text-gray-500 mt-2">
            表示件数: {displayed.length}
            {!search.trim() && <> / ページサイズ: {pageSize}</>}
            {search.trim() && "（検索は最大50件まで表示）"}
          </div>
        </div>
      )}
    </div>
  );
}
