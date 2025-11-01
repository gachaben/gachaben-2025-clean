// ------------------------------------------------------
// 🎵 WeeklyStreakBadge.jsx（今週のリズム称号バッジ）
// ------------------------------------------------------
import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function WeeklyStreakBadge() {
  const [rank, setRank] = useState(null);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data()?.streakData || {};
        const bestStreak = data.bestCorrectStreak || 0;
        setBest(bestStreak);
        setRank(getRank(bestStreak));
      }
    };
    fetchData();
  }, []);

  if (!rank) return null;

  return (
    <div className={`w-full flex flex-col items-center mt-6`}>
      <div
        className={`px-5 py-3 rounded-2xl shadow text-center font-bold text-lg ${rank.color}`}
      >
        {rank.icon} 今週のあなたは「{rank.name}」！
      </div>
      <p className="text-sm text-gray-500 mt-1">
        🧩 今週の最高連続正解数：{best}問
      </p>
      {rank.next && (
        <p className="text-sm text-gray-500 mt-1">
          🎯 次の称号まであと {rank.next - best} 問！
        </p>
      )}
    </div>
  );
}

// ✅ ランク定義
function getRank(streak) {
  if (streak >= 100)
    return {
      name: "メガヒット達成！",
      icon: "🌈",
      color: "bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 text-white",
    };
  if (streak >= 50)
    return { name: "リズムマスター", icon: "🎶", color: "bg-purple-100 text-purple-700", next: 100 };
  if (streak >= 35)
    return { name: "ハーモニープロ", icon: "🎵", color: "bg-pink-100 text-pink-700", next: 50 };
  if (streak >= 20)
    return { name: "メロディメーカー", icon: "🎶", color: "bg-amber-100 text-amber-700", next: 35 };
  if (streak >= 10)
    return { name: "テンポ名人", icon: "🎵", color: "bg-green-100 text-green-700", next: 20 };
  if (streak >= 5)
    return { name: "スタートビート", icon: "🎶", color: "bg-sky-100 text-sky-700", next: 10 };
  return { name: "リズム初心者", icon: "🎵", color: "bg-gray-100 text-gray-700", next: 5 };
}
