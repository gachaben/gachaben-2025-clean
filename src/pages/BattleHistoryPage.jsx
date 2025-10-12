// ------------------------------------------------------
// 📜 BattleHistoryPage.jsx（v1.0）
// バトル履歴一覧：Firestoreから取得して表示
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "@/fbkit";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";

export default function BattleHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "battleRecords"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(list);
      } catch (e) {
        console.error("❌ 履歴取得失敗:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        📜 バトル履歴
      </h1>

      {records.length === 0 ? (
        <p className="text-center text-gray-500">まだバトル履歴がありません。</p>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          {records.map((r) => (
            <div
              key={r.id}
              className="border border-gray-200 rounded-xl bg-white shadow-sm p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-600">
                  {format(r.createdAt?.toDate?.() ?? new Date(), "yyyy/MM/dd HH:mm", { locale: ja })}
                </p>
                <p className="font-semibold text-gray-800">
                  {r.opponent} 戦：{r.result === "win" ? "🏆 勝利" : r.result === "draw" ? "🤝 引き分け" : "💧 敗北"}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                スコア: {r.score ?? 0}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Button
          onClick={() => (window.location.href = "/battle")}
          className="bg-gradient-to-r from-pink-400 to-yellow-400 hover:from-pink-500 hover:to-yellow-500 text-white font-bold px-6 py-2 rounded-full shadow-md"
        >
          🔁 バトルに戻る
        </Button>
      </div>
    </div>
  );
}
