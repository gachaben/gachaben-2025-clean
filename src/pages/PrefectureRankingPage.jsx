import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 例：monthlyScore_202507
};

const PrefectureRankingPage = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const scoreKey = getCurrentMonthScoreKey();

      const prefectureScores = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const prefecture = data.prefecture;
        const score = data[scoreKey] || 0;

        if (!prefecture) return;

        if (!prefectureScores[prefecture]) {
          prefectureScores[prefecture] = 0;
        }

        prefectureScores[prefecture] += score;
      });

      // オブジェクト → 配列に変換＆ソート
      const sorted = Object.entries(prefectureScores)
        .map(([prefecture, totalScore]) => ({ prefecture, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore);

      setRanking(sorted);
    };

    fetchRanking();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 都道府県ランキング</h2>
      <ul>
        {ranking.map((item, index) => (
          <li key={item.prefecture} className="mb-2">
            <span className="font-bold">{index + 1}位：</span>
            {item.prefecture}（{item.totalScore} パワー）
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrefectureRankingPage;
