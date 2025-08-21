import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 例：monthlyScore_202507
};

const PrefectureAwardsPage = () => {
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    const fetchAwards = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const scoreKey = getCurrentMonthScoreKey();

      const teams = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const name = data.name || "ななしさん";
        const prefecture = data.prefecture;
        const score = data[scoreKey] || 0;

        if (!prefecture) return;

        if (!teams[prefecture]) teams[prefecture] = [];
        teams[prefecture].push({ name, score });
      });

      const awardsList = [];

      for (const [prefecture, members] of Object.entries(teams)) {
        // スコア順に並び替え
        const sorted = members.sort((a, b) => b.score - a.score);
        const count = sorted.length;
        const topCount = Math.max(1, Math.floor(count * 0.1)); // 上位1割（最低1人）

        const bestPlayers = sorted.slice(0, topCount);

        bestPlayers.forEach((user, index) => {
          const title = index === 0 ? "🏆 MVP" : "⭐ ベストプレイヤー";
          awardsList.push({
            prefecture,
            name: user.name,
            score: user.score,
            title,
          });
        });
      }

      // スコア順に並べ替え（全体的に）
      awardsList.sort((a, b) => b.score - a.score);
      setAwards(awardsList);
    };

    fetchAwards();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎖 都道府県べつ MVP / ベストプレイヤー</h2>
      <ul>
        {awards.map((entry, index) => (
          <li key={index} className="mb-2">
            {entry.title} - {entry.name}（{entry.prefecture} / {entry.score} パワー）
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrefectureAwardsPage;
