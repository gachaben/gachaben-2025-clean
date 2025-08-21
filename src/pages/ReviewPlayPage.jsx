import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import {
  collection, doc, getDoc,
  writeBatch, addDoc, serverTimestamp
} from "firebase/firestore";

// 各ビュー
import McqView from "@/components/review/McqView";
import KeypadView from "@/components/review/KeypadView";
import SequenceView from "@/components/review/SequenceView";
import TextInputView from "@/components/review/TextInputView";

// 出題タイプごとのレジストリ
const registry = {
  mcq: McqView,
  keypad: KeypadView,
  sequence: SequenceView,
  text: TextInputView,
};

export default function ReviewPlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const passedIds = Array.isArray(state?.ids) ? state.ids.filter(Boolean) : [];
  const [ids, setIds] = useState(passedIds);
  const [cursor, setCursor] = useState(0);
  const [current, setCurrent] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [result, setResult] = useState([]);
  const resultsRef = useRef([]); // finish用：常に最新

  // 初期ロード
  useEffect(() => {
    (async () => {
      const useIds = Array.isArray(passedIds) ? passedIds.filter(Boolean) : [];
      if (useIds.length === 0) {
        navigate("/review-list", { replace: true });
        return;
      }
      setIds(useIds);
      await loadByIndex(0, useIds);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // docロード（存在しない/欠陥docはスキップ）
  async function loadByIndex(idx, baseIds = ids) {
    if (!Array.isArray(baseIds) || idx >= baseIds.length) {
      await finish();
      return;
    }
    const id = baseIds[idx];
    try {
      const snap = await getDoc(doc(db, "mistakes", id));
      if (!snap.exists()) {
        if (idx + 1 < baseIds.length) return loadByIndex(idx + 1, baseIds);
        return finish();
      }
      const data = snap.data();
      if (!data || !data.question) {
        if (idx + 1 < baseIds.length) return loadByIndex(idx + 1, baseIds);
        return finish();
      }
      setCurrent({ id, ...data });
      setCursor(idx);
      setFeedback("");
    } catch {
      if (idx + 1 < baseIds.length) return loadByIndex(idx + 1, baseIds);
      return finish();
    }
  }

  // 結果の同期更新
  function upsertResult(id, okFlag) {
    setResult(prev => {
      const prevWrong = prev.find(r => r.id === id)?.wrongTries ?? 0;
      const next = [
        ...prev.filter(r => r.id !== id),
        { id, ok: !!okFlag, wrongTries: okFlag ? prevWrong : prevWrong + 1 }
      ];
      resultsRef.current = next;
      return next;
    });
  }

  function handleCorrect() {
    if (!current) return;
    upsertResult(current.id, true);
    setFeedback("正解！🎉");
    setTimeout(next, 350);
  }
  function handleWrong() {
    if (!current) return;
    upsertResult(current.id, false);
    setFeedback("ちがう… もう一度挑戦！");
  }

  async function next() {
    const nextIdx = cursor + 1;
    if (nextIdx >= ids.length) return finish();
    await loadByIndex(nextIdx);
  }

  async function finish() {
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? "guest";
    const final = resultsRef.current;

    await addDoc(collection(db, "reviews"), {
      userId: uid,
      items: final,
      total: final.length,
      correct: final.filter(r => r.ok).length,
      createdAt: serverTimestamp(),
    });

    const batch = writeBatch(db);
    final.filter(r => r.ok).forEach(r => {
      batch.update(doc(db, "mistakes", r.id), {
        status: "reviewed",
        reviewedAt: serverTimestamp(),
      });
    });
    await batch.commit();

    navigate("/review-list", { replace: true });
  }

  if (!current) return <div>読み込み中...</div>;

  // 出題タイプ：type優先。無ければ meta.input === 'text' ＞ options有無
  const type = current?.type
    ? current.type
    : (current?.meta?.input === "text"
        ? "text"
        : (Array.isArray(current?.options) ? "mcq" : "keypad"));

  const View = registry[type] ?? McqView;

  return (
    <div style={{ padding: 16 }}>
      <h2>復習 ({cursor + 1}/{ids.length})</h2>
      <div style={{ marginTop: 8, marginBottom: 12 }}>Q: {current.question}</div>

      <View question={current} onCorrect={handleCorrect} onWrong={handleWrong} />

      <div style={{ minHeight: 28, marginTop: 10, color: "#666" }}>{feedback}</div>
    </div>
  );
}
