// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/fbkit";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 萓具ｼ嗄onthlyScore_202507
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

      // 繧ｪ繝悶ず繧ｧ繧ｯ繝・竊・驟榊・縺ｫ螟画鋤・・た繝ｼ繝・
      const sorted = Object.entries(prefectureScores)
        .map(([prefecture, totalScore]) => ({ prefecture, totalScore }))
        .sort((a, b) => b.totalScore - a.totalScore);

      setRanking(sorted);
    };

    fetchRanking();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">醇 驛ｽ驕灘ｺ懃恁繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ</h2>
      <ul>
        {ranking.map((item, index) => (
          <li key={item.prefecture} className="mb-2">
            <span className="font-bold">{index + 1}菴搾ｼ・/span>
            {item.prefecture}・・item.totalScore} 繝代Ρ繝ｼ・・
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrefectureRankingPage;
