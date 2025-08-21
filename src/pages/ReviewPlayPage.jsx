// src/pages/ReviewPlayPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { db } from "@/firebase";
import {
  collection, doc, getDoc, getDocs,
  writeBatch, addDoc, serverTimestamp
} from "firebase/firestore";

function buildOptions(m) {
  // mistakes に options が無い場合のフォールバック（ダミー3択+正解）
  if (Array.isArray(m.options) && m.options.length >= 2) return [...m.options];
  const wrongs = [];
  const c = String(m.correctAnswer ?? "");
  // 適当にダミーを生成（重複回避）
  for (let i = 0, n = 1; wrongs.length < 3 && i < 20; i += 1, n += 1) {
    const w = c + "※" + n;
    if (w !== c) wrongs.push(w);
  }
  return [c, ...wrongs].sort(() => Math.random() - 0.5);
}

export default function ReviewPlayPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const passedIds = Array.isArray(state?.ids) ? state.ids.filter(Boolean) : [];

  const [ids, setIds] = useState(passedIds);
  const [cursor, setCursor] = useState(0);
  const [current, setCurrent] = useState(null);
  const [choices, setChoices] = useState([]);   // 表示中の選択肢（間違えるたびに減る）
  const [result, setResult] = useState([]);     // {id, wrongTries, ok:true}
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
      if (useIds.length === 0) { navigate("/review-list", { replace: true }); return; }
      await loadByIndex(0, useIds);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadByIndex(idx, baseIds = ids) {
    const id = baseIds[idx];
    const d = await getDoc(doc(db, "mistakes", id));
    const m = { id, ...d.data() };
    setCurrent(m);
    setChoices(buildOptions(m));
    setCursor(idx);
    setFeedback("");
  }

  async function pick(opt) {
    if (!current) return;
    const isCorrect = String(opt) === String(current.correctAnswer ?? "");
    if (isCorrect) {
      // 正解 → 次へ
      setResult(prev => {
        const prevWrong = prev.find(r => r.id === current.id)?.wrongTries ?? 0;
        return [...prev.filter(r => r.id !== current.id), { id: current.id, ok: true, wrongTries: prevWrong }];
      });
      setFeedback("正解！🎉");
      setTimeout(next, 350);
      return;
    }

    // 不正解 → 該当選択肢を削除して再挑戦
    setChoices(prev => prev.filter(c => c !== opt));
    setResult(prev => {
      const prevWrong = prev.find(r => r.id === current.id)?.wrongTries ?? 0;
      const rest = prev.filter(r => r.id !== current.id);
      return [...rest, { id: current.id, ok: false, wrongTries: prevWrong + 1 }];
    });
    setFeedback("ちがう… 選択肢を1つ減らしたよ。");
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

    // 1回でも正解に到達したものは reviewed
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

  return (
    <div style={{ padding: 16 }}>
      <h2>復習 ({cursor + 1}/{ids.length})</h2>
      <div style={{ marginTop: 8, marginBottom: 12 }}>Q: {current.question}</div>

      <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => pick(c)}
            style={{
              padding: "10px 12px",
              textAlign: "left",
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ minHeight: 28, marginTop: 10, color: "#666" }}>{feedback}</div>
    </div>
  );
}
