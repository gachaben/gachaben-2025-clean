// src/pages/ProblemsTestPage.jsx
import React, { useEffect, useState } from "react";
import { getFirestoreDb } from "@/fbkit";
const db = getFirestoreDb();
import { collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth"; // ← 追加
import { addMistake } from "@/lib/mistakes"; // ← 追加

export default function ProblemsTestPage() {
  const [problems, setProblems] = useState([]);
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null); // ← stateで管理

  // 🔑 ログイン状態を監視
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
      console.log("onAuthStateChanged uid:", user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  // Firestore から問題を読み込む
  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(db, "problems"),
          where("category", "==", "textbook")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProblems(list);
        setCurrent(list[0] || null);
      } catch (e) {
        console.error("failed to load problems:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (!current) return <div>問題が見つかりません</div>;

  const checkAnswer = async (choice, idx) => {
    console.log("uid:", uid);
    console.log("current:", current);

    const correctIdx = current.body?.answer;
    const isCorrect = idx === correctIdx;

    if (isCorrect) {
      setResult("correct");
      alert("正解！");
    } else {
      setResult("wrong");
      alert("不正解…");

      // 🔽 不正解だったら mistakes に登録
      if (uid) {
        try {
          await addMistake(uid, current);
          console.log("mistake saved:", current.id);
        } catch (e) {
          console.error("failed to save mistake:", e);
        }
      } else {
        console.warn("uid が null のため mistakes 保存をスキップしました");
      }
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Firestoreから取得した問題（category=textbook）</h2>

      <div style={{ margin: "16px 0" }}>
        <div>Q: {current.body?.question ?? "（問題文なし）"}</div>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          {current.body?.choices?.map((c, idx) => (
            <button
              key={idx}
              onClick={() => checkAnswer(c, idx)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background:
                  result && idx === current.body.answer
                    ? "#c8f7c5"
                    : result === "wrong" && idx !== current.body.answer
                    ? "#fdd"
                    : "#fff",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {result === "correct" && <p style={{ color: "green" }}>⭕ 正解！</p>}
      {result === "wrong" && <p style={{ color: "red" }}>❌ 不正解…</p>}

      <button
        onClick={() => window.location.reload()}
        style={{ marginTop: 16 }}
      >
        再読込
      </button>
    </div>
  );
}
