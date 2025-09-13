// src/pages/ReviewSessionStart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

export default function ReviewSessionStart() {
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState("");
  const [raw, setRaw] = useState([]);
  const [state, setState] = useState("loading");
  const [msg, setMsg] = useState("");

  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [limitN, setLimitN] = useState(10);

  // 認証監視
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || ""));
    return () => unsub();
  }, [auth]);

  // データ購読
  useEffect(() => {
    if (!uid) {
      setRaw([]);
      setState("ready");
      return;
    }
    setState("loading");
    const qy = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),            // uid → userId に統一
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        setRaw(snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) })));
        setState("ready");
      },
      (err) => {
        setMsg(err?.message || "読み込みに失敗しました");
        setState("error");
      }
    );
    return () => unsub();
  }, [db, uid]);

  const subjects = useMemo(
    () => Array.from(new Set(raw.map((x) => x.subject).filter(Boolean))),
    [raw]
  );

  const units = useMemo(() => {
    const s = new Set(
      raw.filter((x) => !subject || x.subject === subject)
         .map((x) => x.unit)
         .filter(Boolean)
    );
    return Array.from(s);
  }, [raw, subject]);

  const items = useMemo(() => {
    let arr = [...raw];
    if (subject) arr = arr.filter((x) => x.subject === subject);
    if (unit) arr = arr.filter((x) => x.unit === unit);
    if (onlyOpen) {
      // 未復習＝isReviewed=false（status があるなら open のみ）
      arr = arr.filter((x) => !x.isReviewed && (x.status ? x.status === "open" : true));
    }
    return arr;
  }, [raw, subject, unit, onlyOpen]);

  const startSession = () => {
    if (items.length === 0) return alert("対象がありません。条件を調整してね。");
    const n = Math.max(1, Math.min(Number(limitN) || 1, items.length));
    const take = items.slice(0, n);
    // ReviewPlayPage（state.ids を渡す流れに合わせる）
    const ids = take.map((m) => m.id);
    navigate(`/review/play/${ids[0]}`, { state: { ids } });
  };

  if (state === "loading") return <div className="p-4">読み込み中…</div>;
  if (state === "error") return <div className="p-4 text-red-600">Error: {msg}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-bold">連続復習スタート</h2>

      <div className="p-3 border rounded bg-white flex flex-wrap gap-2 items-center">
        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setUnit("");
          }}
          className="px-3 py-2 border rounded"
        >
          <option value="">すべての科目</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="px-3 py-2 border rounded"
          disabled={!subject}
        >
          <option value="">すべての単元</option>
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={onlyOpen}
            onChange={(e) => setOnlyOpen(e.target.checked)}
          />
          未復習のみ
        </label>

        <label className="flex items-center gap-2 text-sm">
          出題数
          <input
            type="number"
            min={1}
            max={50}
            value={limitN}
            onChange={(e) => setLimitN(e.target.value)}
            className="w-20 px-2 py-1 border rounded"
          />
        </label>

        <div className="text-xs text-gray-500 ml-auto">対象 {items.length} 件</div>
      </div>

      <button onClick={startSession} className="px-4 py-2 rounded bg-emerald-600 text-white">
        連続復習をはじめる
      </button>
    </div>
  );
}
