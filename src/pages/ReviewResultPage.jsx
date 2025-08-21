// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import {
  doc, getDoc, updateDoc, writeBatch, collection, addDoc, serverTimestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function ReviewPlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ids = state?.ids ?? [];
  const [cursor, setCursor] = useState(0);
  const [current, setCurrent] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState([]); // {id, ok:boolean}

  useEffect(() => {
    (async () => {
      if (ids.length === 0) { navigate("/review-list"); return; }
      const d = await getDoc(doc(db, "mistakes", ids[0]));
      setCurrent({ id: ids[0], ...d.data() });
      setLoaded(true);
    })();
  }, [ids, navigate]);

  async function load(idx) {
    const d = await getDoc(doc(db, "mistakes", ids[idx]));
    setCurrent({ id: ids[idx], ...d.data() });
    setCursor(idx);
  }

  async function answer(ok) {
    setResult(prev => [...prev, { id: current.id, ok }]);
    const next = cursor + 1;
    if (next >= ids.length) {
      await finish();
      return;
    }
    await load(next);
  }

  async function finish() {
    // ① セッション保存
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? "guest";
    await addDoc(collection(db, "reviews"), {
      userId: uid,
      items: result,
      total: result.length,
      correct: result.filter(r=>r.ok).length,
      createdAt: serverTimestamp(),
    });

    // ② OK だったものは閉じる（status=reviewed）
    const batch = writeBatch(db);
    result.filter(r => r.ok).forEach(r => {
      batch.update(doc(db, "mistakes", r.id), {
        status: "reviewed",
        reviewedAt: serverTimestamp(),
      });
    });
    await batch.commit();

    navigate("/review-list", { replace: true });
  }

  if (!loaded || !current) return <div>読み込み中...</div>;
  return (
    <div style={{ padding: 16 }}>
      <h2>復習 ({cursor+1}/{ids.length})</h2>
      <div style={{ margin: "16px 0", fontSize: 18 }}>
        <div>Q: {current.question}</div>
        <div style={{ color: "#888", marginTop: 8 }}>
          正解: {current.correctAnswer}（自分の解答: {current.userAnswer}）
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => answer(true)}>理解できた 👍</button>
        <button onClick={() => answer(false)}>まだ不安 👀</button>
      </div>
    </div>
  );
}

