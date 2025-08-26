// src/pages/BattleDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { getFirestoreDb } from "@/firebase";

const db = getFirestoreDb();

function fmt(ts) {
  if (!ts) return "-";
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch {
    return "-";
  }
}

export default function BattleDetailPage() {
  const { bid } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [battle, setBattle] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "battles", bid));
        if (!snap.exists()) {
          setErr("not found");
        } else {
          setBattle({ id: snap.id, ...(snap.data() || {}) });
        }
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [bid]);

  if (loading) return <div className="p-4 text-sm text-gray-600">読み込み中…</div>;
  if (err) return <div className="p-4 text-sm text-red-600">取得失敗: {String(err)}</div>;
  if (!battle) return <div className="p-4">データが見つかりません</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-lg font-bold">Battle Detail</h1>
      <div className="text-sm text-gray-600">id: {battle.id}</div>
      <div className="text-sm">開始: {fmt(battle.start)}</div>
      <div className="text-sm">終了: {fmt(battle.end)}</div>
      <div className="text-sm">勝者: {battle.winner}</div>

      {/* プレイヤー概要 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">あなた</h2>
          <div className="text-sm">item: {battle.me?.itemName ?? "-"}</div>
          <div className="text-sm">initialPw: {battle.me?.initialPw ?? "-"}</div>
        </div>
        <div className="border rounded p-3">
          <h2 className="font-semibold mb-2">相手</h2>
          <div className="text-sm">item: {battle.enemy?.itemName ?? "-"}</div>
          <div className="text-sm">initialPw: {battle.enemy?.initialPw ?? "-"}</div>
        </div>
      </div>

      {/* ラウンドリプレイ */}
      <div className="space-y-4">
        <h2 className="font-semibold">ラウンドリプレイ</h2>
        {battle.rounds?.map((r, i) => (
          <div key={i} className="flex gap-4">
            {/* 自分 */}
            <div className="flex-1">
              <div className="bg-blue-50 border rounded-lg p-2">
                <div className="text-xs text-gray-500">Round {i+1}</div>
                <div className="text-sm">ベット: {r.me?.pw}</div>
                <div className="text-sm">解答: {r.me?.correct ? "⭕" : "❌"}</div>
              </div>
            </div>
            {/* 問題 */}
            <div className="flex-1 text-center flex items-center justify-center">
              <div className="text-sm font-medium">{r.question ?? "-"}</div>
            </div>
            {/* 相手 */}
            <div className="flex-1">
              <div className="bg-red-50 border rounded-lg p-2 text-right">
                <div className="text-xs text-gray-500">Round {i+1}</div>
                <div className="text-sm">ベット: {r.enemy?.pw}</div>
                <div className="text-sm">解答: {r.enemy?.correct ? "⭕" : "❌"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/history" className="text-blue-600 hover:underline text-sm">← 戻る</Link>
    </div>
  );
}
