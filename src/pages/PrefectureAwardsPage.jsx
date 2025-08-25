import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/fbkit";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 萓具ｼ嗄onthlyScore_202507
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
        const name = data.name || "縺ｪ縺ｪ縺励＆繧・;
        const prefecture = data.prefecture;
        const score = data[scoreKey] || 0;

        if (!prefecture) return;

        if (!teams[prefecture]) teams[prefecture] = [];
        teams[prefecture].push({ name, score });
      });

      const awardsList = [];

      for (const [prefecture, members] of Object.entries(teams)) {
        // 繧ｹ繧ｳ繧｢鬆・↓荳ｦ縺ｳ譖ｿ縺・
        const sorted = members.sort((a, b) => b.score - a.score);
        const count = sorted.length;
        const topCount = Math.max(1, Math.floor(count * 0.1)); // 荳贋ｽ・蜑ｲ・域怙菴・莠ｺ・・

        const bestPlayers = sorted.slice(0, topCount);

        bestPlayers.forEach((user, index) => {
          const title = index === 0 ? "醇 MVP" : "箝・繝吶せ繝医・繝ｬ繧､繝､繝ｼ";
          awardsList.push({
            prefecture,
            name: user.name,
            score: user.score,
            title,
          });
        });
      }

      // 繧ｹ繧ｳ繧｢鬆・↓荳ｦ縺ｹ譖ｿ縺茨ｼ亥・菴鍋噪縺ｫ・・
      awardsList.sort((a, b) => b.score - a.score);
      setAwards(awardsList);
    };

    fetchAwards();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">事 驛ｽ驕灘ｺ懃恁縺ｹ縺､ MVP / 繝吶せ繝医・繝ｬ繧､繝､繝ｼ</h2>
      <ul>
        {awards.map((entry, index) => (
          <li key={index} className="mb-2">
            {entry.title} - {entry.name}・・entry.prefecture} / {entry.score} 繝代Ρ繝ｼ・・
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PrefectureAwardsPage;
