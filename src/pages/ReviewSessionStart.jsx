// src/pages/ReviewSessionStart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
=======
import { getFirestoreDb, getFirebaseAuth } from "@/fbkit";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

export default function ReviewSessionStart() {
  const [mistakes, setMistakes] = useState([]);
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
<<<<<<< HEAD
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
=======
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)

  // 認証監視
  useEffect(() => {
<<<<<<< HEAD
    let unsub = () => {};
    (async () => {
      try {
        await ensureSignedIn();
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("not signed in");

        const qy = query(
          collection(db, "mistakes"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );

        unsub = onSnapshot(
          qy,
          (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setRaw(arr);
            setState("ready");
          },
          (err) => {
            setMsg(err.message);
            setState("error");
          }
        );
      } catch (e) {
        setMsg(e.message);
        setState("error");
      }
    })();
    return () => unsub();
  }, [db, uid]);

  const subjects = useMemo(
    () => Array.from(new Set(raw.map((x) => x.subject).filter(Boolean))),
    [raw]
  );

  const units = useMemo(() => {
    const s = new Set(
      raw
        .filter((x) => !subject || x.subject === subject)
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
      arr = arr.filter((x) => !x.isReviewed && (x.status ? x.status === "open" : true));
    }
    return arr;
  }, [raw, subject, unit, onlyOpen]);

  const startSession = () => {
    if (items.length === 0) return alert("対象がありません。条件を調整してね。");
    const n = Math.max(1, Math.min(Number(limitN) || 1, items.length));
    const take = items.slice(0, n);
    const ids = take.map((m) => m.id);
    navigate(`/review/play/${ids[0]}`, { state: { ids } });
=======
    const fetchMistakes = async () => {
      const db = getFirestoreDb();
      const auth = getFirebaseAuth();
      const user = auth.currentUser;
      if (!user) {
        setMistakes([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "mistakes"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMistakes(rows);
      setLoading(false);
    };
    fetchMistakes();
  }, []);

  const startSession = () => {
    if (mistakes.length === 0) return alert("復習する問題がありません");

    // ランダムに選択
    const shuffled = [...mistakes].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // localStorage にセッション保存
    localStorage.setItem("reviewSession", JSON.stringify(selected.map((m) => m.id)));

    // 1問目へ遷移
    navigate(`/review/play/${selected[0].id}`);
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
  };

  if (loading) return <div className="p-4">読み込み中…</div>;

  return (
<<<<<<< HEAD
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
            <option key={s} value={s}>
              {s}
            </option>
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
            <option key={u} value={u}>
              {u}
            </option>
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
=======
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">連続復習セッション開始</h1>

      <div className="space-y-3">
        <label className="block">
          出題数を選択:
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="ml-2 border rounded px-2 py-1"
          >
            <option value={3}>3問</option>
            <option value={5}>5問</option>
            <option value={10}>10問</option>
          </select>
        </label>
      </div>

      <button
        onClick={startSession}
        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
      >
        セッション開始
>>>>>>> 718a510 ( Firestore接続＆問題取得成功！不正解時にmistakesへ記録できるようにした)
      </button>
    </div>
  );
}
