// src/pages/ReviewPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";

export default function ReviewPage() {
  const navigate = useNavigate();
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [uid, setUid] = useState("");
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ログイン状態監視
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || "");
    });
    return () => unsub();
  }, [auth]);

  // 日付フォーマッタ
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

  // mistakes 読み込み
  useEffect(() => {
    if (!uid) {
      setMistakes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const q = query(
      collection(db, "mistakes"),
      where("userId", "==", uid),  // ← 修正
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
        console.error("[review] onSnapshot error:", e);
        setError(e?.message || "読み込みに失敗しました");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid, db]);

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-500">エラー: {error}</div>;

  // 空表示コンポーネント
  const Empty = () => (
    <div className="mt-6 border border-dashed border-gray-400 p-6 rounded-lg text-center bg-gray-50">
      {uid ? (
        <>
          <div className="mb-2 text-lg">間違えた問題はありません 🎉</div>
          <div className="text-sm opacity-80 mb-4">
            練習やチャレンジで新しい問題に挑戦してみよう
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/")}
              className="px-3 py-2 border rounded bg-white"
            >
              トップへ
            </button>
            <button
              onClick={() => navigate("/challenge")}
              className="px-3 py-2 border rounded bg-cyan-100"
            >
              チャレンジへ進む
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-2 text-lg">ログインが必要です</div>
          <Link to="/login" className="text-blue-600 underline">
            ログイン / 新規登録へ
          </Link>
        </>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-3">復習モード</h1>

      {mistakes.length === 0 ? (
        <Empty />
      ) : (
        <ul className="space-y-3">
          {mistakes.map((m) => {
            const created = toDate(m.createdAt);
            return (
              <li
                key={m.id}
                className="border p-3 rounded bg-white shadow-sm space-y-1"
              >
                <div className="font-semibold">{m.text || "(no text)"}</div>
                {"picked" in m && <div>あなたの選択: {String(m.picked)}</div>}
                {"answer" in m && <div>正解: {String(m.answer)}</div>}
                <div className="text-xs opacity-70">
                  追加日時: {created ? fmt.format(created) : "-"}
                </div>
                <button
                  onClick={() =>
                    navigate(`/review/play/${encodeURIComponent(m.id)}`)
                  }
                  className="mt-2 px-3 py-1 border rounded bg-blue-100"
                >
                  この問題で復習する
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        <Link to="/login" className="underline">
          ログインへ / 変更へ
        </Link>
      </div>
    </div>
  );
}
