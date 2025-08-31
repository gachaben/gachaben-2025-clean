// src/pages/ReviewQuickStart.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function ReviewQuickStart() {
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState(auth.currentUser?.uid ?? null);
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // authの変化を追従
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, [auth]);

  const fmt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return { format: (d) => d?.toString?.() ?? "" };
    }
  }, []);

  const toDate = (val) => {
    if (val?.toDate) return val.toDate();
    if (typeof val === "number") return new Date(val);
    if (typeof val === "string") return new Date(val);
    return null;
  };

  // mistakes 購読
  useEffect(() => {
    if (!uid) {
      setMistakes([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "mistakes"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMistakes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (e) => {
        console.error("[review-quickstart] onSnapshot error:", e);
        setError(e?.message || "読み込みに失敗しました");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [db, uid]);

  if (loading) return <div style={{ padding: 16 }}>読み込み中...</div>;
  if (error) return <div style={{ padding: 16 }}>エラー: {error}</div>;

  const Empty = () => (
    <div
      style={{
        marginTop: 24,
        border: "1px dashed #bbb",
        padding: 24,
        borderRadius: 12,
        textAlign: "center",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 8 }}>復習対象はまだありません 🎉</div>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
        練習やチャレンジで新しい問題に挑戦してみよう
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button
          onClick={() => navigate("/")}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "white" }}
        >
          トップへ
        </button>
        <button
          onClick={() => navigate("/review/quick-seed")}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #0aa", background: "#0ff2" }}
        >
          サンプル投入
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <h1 className="text-xl font-bold mb-2">復習モード QuickStart</h1>

      {mistakes.length === 0 ? (
        <Empty />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
          {mistakes.map((m) => {
            const created = toDate(m.createdAt);
            return (
              <li
                key={m.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "grid",
                  gap: 4,
                }}
              >
                <div style={{ fontWeight: 600 }}>{m.text}</div>
                <div>あなたの選択: {String(m.picked ?? "")}</div>
                <div>
                  正解:{" "}
                  {Array.isArray(m.answer)
                    ? JSON.stringify(m.answer)
                    : String(m.answer ?? "")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  追加日時: {created ? fmt.format(created) : "-"}
                </div>
                <div>
                  <button
                    onClick={() =>
                      navigate(`/review/play/${encodeURIComponent(m.id)}`)
                    }
                    style={{
                      marginTop: 8,
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #09f",
                      background: "#09f2",
                    }}
                  >
                    この問題で復習する
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
