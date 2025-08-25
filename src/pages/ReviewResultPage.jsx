// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "@/fbkit";
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
    // 竭 繧ｻ繝・す繝ｧ繝ｳ菫晏ｭ・
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? "guest";
    await addDoc(collection(db, "reviews"), {
      userId: uid,
      items: result,
      total: result.length,
      correct: result.filter(r=>r.ok).length,
      createdAt: serverTimestamp(),
    });

    // 竭｡ OK 縺縺｣縺溘ｂ縺ｮ縺ｯ髢峨§繧具ｼ・tatus=reviewed・・
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

  if (!loaded || !current) return <div>隱ｭ縺ｿ霎ｼ縺ｿ荳ｭ...</div>;
  return (
    <div style={{ padding: 16 }}>
      <h2>蠕ｩ鄙・({cursor+1}/{ids.length})</h2>
      <div style={{ margin: "16px 0", fontSize: 18 }}>
        <div>Q: {current.question}</div>
        <div style={{ color: "#888", marginTop: 8 }}>
          豁｣隗｣: {current.correctAnswer}・郁・蛻・・隗｣遲・ {current.userAnswer}・・
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => answer(true)}>逅・ｧ｣縺ｧ縺阪◆ 総</button>
        <button onClick={() => answer(false)}>縺ｾ縺荳榊ｮ・操</button>
      </div>
    </div>
  );
}

