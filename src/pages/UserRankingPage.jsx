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

const UserRankingPage = () => {
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const scoreKey = getCurrentMonthScoreKey();

      const userList = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const score = data[scoreKey] || 0;
        const name = data.name || "縺ｪ縺ｪ縺励＆繧・;
        const prefecture = data.prefecture || "";

        if (score > 0) {
          userList.push({ name, prefecture, score });
        }
      });

      userList.sort((a, b) => b.score - a.score);
      setRanking(userList);
    };

    fetchRanking();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">遵 蛟倶ｺｺ繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ</h2>
      <ul>
        {ranking.map((user, index) => (
          <li key={index} className="mb-2">
            <span className="font-bold">{index + 1}菴搾ｼ・/span>
            {user.name}・・user.prefecture} / {user.score} 繝代Ρ繝ｼ・・
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRankingPage;
