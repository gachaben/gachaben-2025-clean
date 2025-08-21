// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import {
  collection, doc, getDoc,
  writeBatch, addDoc, serverTimestamp
} from "firebase/firestore";

// 各ビューを import
import McqView from "@/components/review/McqView";
import KeypadView from "@/components/review/KeypadView";

// 出題タイプごとのレジストリ
const registry = { mcq: McqView, keypad: KeypadView };

export default function ReviewPlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const passedIds = Array.isArray(state?.ids) ? state.ids.filter(Boolean) : [];
  const [ids, setIds] = useState(passedIds);
  const [cursor, setCursor] = useState(0);
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState([]);     // {id, ok, wrongTries}
  const [feedback, setFeedback] = useState(""); // 一時メッセージ

  // 初期ロード
  useEffect(() => {
    (async () => {
      let useIds = passedIds;
      if (useIds.length === 0) {
        navigate("/review-list", { replace: true });
        return;
      }
      setIds(useIds);
      await loadByIndex(0, useIds);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadByIndex(idx, baseIds = ids) {
    const id = baseIds[idx];
    const d = await getDoc(doc(db, "mistakes", id));
    const m = { id, ...d.data() };
    setCurrent(m);
    setCursor(idx);
    setFeedback("");
  }

  function handleCorrect() {
    if (!current) return;
    // 正解 → 次へ
    setResult(prev => {
      const prevWrong = prev.find(r => r.id === current.id)?.wrongTries ?? 0;
      return [
        ...prev.filter(r => r.id !== current.id),
        { id: current.id, ok: true, wrongTries: prevWrong }
      ];
    });
    setFeedback("正解！🎉");
    setTimeout(next, 350);
  }

  function handleWrong() {
    if (!current) return;
    setResult(prev => {
      const prevWrong = prev.find(r => r.id === current.id)?.wrongTries ?? 0;
      const rest = prev.filter(r => r.id !== current.id);
      return [...rest, { id: current.id, ok: false, wrongTries: prevWrong + 1 }];
    });
    setFeedback("ちがう… もう一度挑戦！");
  }

  async function next() {
    const nextIdx = cursor + 1;
    if (nextIdx >= ids.length) { await finish(); return; }
    await loadByIndex(nextIdx);
  }

  async function finish() {
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? "guest";

    // セッション保存
    await addDoc(collection(db, "reviews"), {
      userId: uid,
      items: result,
      total: result.length,
      correct: result.filter(r => r.ok).length,
      createdAt: serverTimestamp(),
    });

    // 正解に到達したものを reviewed に更新
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

  if (!current) return <div>読み込み中...</div>;

  // 出題タイプに応じてビューを切り替える
  // type が無ければ options の有無で推論（options 無し ⇒ keypad）
  const type =
    current?.type
      ? current.type
      : (Array.isArray(current?.options) ? "mcq" : "keypad");

  const View = registry[type] ?? McqView;

  return (
    <div style={{ padding: 16 }}>
      <h2>復習 ({cursor + 1}/{ids.length})</h2>
      <div style={{ marginTop: 8, marginBottom: 12 }}>Q: {current.question}</div>

      <View
        question={current}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
      />

      <div style={{ minHeight: 28, marginTop: 10, color: "#666" }}>{feedback}</div>
    </div>
  );
}
