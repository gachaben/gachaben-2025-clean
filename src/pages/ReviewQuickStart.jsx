// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db, auth, ensureSignedIn } from "../firebase";

export default function ReviewQuickStart() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState("loading"); // loading | empty | ready | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        // ★ uid が確定するまで待つ
        await ensureSignedIn();
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("not signed in");

        const q = query(
          collection(db, "mistakes"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );

        unsub = onSnapshot(
          q,
          (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setItems(arr);
            setState(arr.length ? "ready" : "empty");
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
  }, []);

  if (state === "loading") return <div className="p-4">読み込み中…</div>;
  if (state === "error")   return <div className="p-4 text-red-600">Error: {msg}</div>;
  if (state === "empty")
    return (
      <div className="max-w-xl mx-auto p-4">
        <div className="border rounded p-4 bg-white">
          <div className="font-semibold mb-1">間違えた問題はありません 🐞</div>
          <div className="text-sm text-gray-600 mb-2">
            いちどバトルで間違えると、ここに復習リストが表示されます。
          </div>
          <div className="flex gap-2">
            <a href="/" className="px-3 py-2 rounded bg-gray-100">トップへ</a>
            <a href="/battle" className="px-3 py-2 rounded bg-blue-600 text-white">チャレンジへ進む</a>
          </div>
        </div>
      </div>
    );

  // ready
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <h2 className="text-xl font-bold">復習モード</h2>
      {items.map((m) => (
        <div key={m.id} className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-500 mb-1">
            問題ID: {m.questionId} ／ {m.createdAt?.toDate?.().toLocaleString?.() ?? "…"}
          </div>
          <div className="font-semibold mb-1">{m.text || "（問題文なし）"}</div>
          <div className="text-sm text-gray-700 mb-2">
            あなたの答え: <b>{m.choice}</b> ／ 正解: <b>{m.correct}</b>
          </div>
          <button className="px-3 py-2 rounded bg-emerald-600 text-white">
            この問題で復習する
          </button>
        </div>
      ))}
    </div>
  );
}
