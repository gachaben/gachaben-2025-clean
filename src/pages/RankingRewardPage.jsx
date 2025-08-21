// ✅ /src/pages/RankingRewardPage.jsx

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";

const getCurrentMonthId = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${y}${m}`;
};

const RankingRewardPage = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      const monthId = getCurrentMonthId();
      const snapshot = await getDocs(collection(db, `rewardPower_${monthId}`));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const sorted = data
        .filter((user) => user.total && user.nickname)
        .sort((a, b) => b.total - a.total);

      const top10PercentCount = Math.ceil(sorted.length * 0.1);
      const topPlayers = sorted.slice(0, top10PercentCount);
      setRanking(topPlayers);
      setLoading(false);
    };

    fetchRanking();
  }, []);

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇"; // 🥇 = 🥇 金
    if (index === 1) return "🥈"; // 🥈 = 🥈 銀
    if (index === 2) return "🥉"; // 🥉 = 🥉 銅
    return "";
  };

  const getMonthLabel = () => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-4">🌏 月間パワーランキング</h1>
      <p className="text-center text-gray-500 mb-6">
        対象月：{getMonthLabel()} ／ 上位10%のプレイヤーのみ表示
      </p>

      {loading ? (
        <p className="text-center">読み込み中...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">順位</th>
              <th className="border px-2 py-1">ニックネーム</th>
              <th className="border px-2 py-1">学年</th>
              <th className="border px-2 py-1">都道府県</th>
              <th className="border px-2 py-1">合計パワー</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((user, index) => (
              <tr key={user.id} className="text-center">
                <td className="border px-2 py-1">
                  {index + 1}位 {getMedalEmoji(index)}
                </td>
                <td className="border px-2 py-1">{user.nickname}</td>
                <td className="border px-2 py-1">{user.grade}</td>
                <td className="border px-2 py-1">{user.prefecture}</td>
                <td className="border px-2 py-1 font-bold">{user.total} pw</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RankingRewardPage;