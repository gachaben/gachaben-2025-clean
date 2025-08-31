// src/pages/ReviewQuickSeed.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ReviewQuickSeed() {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const seed = async () => {
    const u = auth.currentUser;
    if (!u) return alert("ログインしてから実行してください。");
    setBusy(true);
    const samples = [
      { text: "5 + 3 は？", answer: "8", picked: null },
      { text: "都道府県の数は？", answer: "47", picked: null },
      { text: "水の沸点(℃)は？", answer: "100", picked: null },
    ];
    try {
      await Promise.all(
        samples.map((s) =>
          addDoc(collection(db, "mistakes"), {
            uid: u.uid,
            ...s,
            createdAt: serverTimestamp(),
          })
        )
      );
      alert("サンプルを3件投入しました。");
      navigate("/review/quick");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">復習サンプル投入</h1>
      <button
        onClick={seed}
        disabled={busy}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-60"
      >
        {busy ? "投入中..." : "サンプルを投入する"}
      </button>
    </div>
  );
}
