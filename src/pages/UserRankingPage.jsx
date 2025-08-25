// @KEEP 理由: 柱（❤/ガチャ/ミッション/ランキング/問題履歴）に一致
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 例：monthlyScore_202507
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
        const name = data.name || "ななしさん";
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
      <h2 className="text-2xl font-bold mb-4">🏅 個人ランキング</h2>
      <ul>
        {ranking.map((user, index) => (
          <li key={index} className="mb-2">
            <span className="font-bold">{index + 1}位：</span>
            {user.name}（{user.prefecture} / {user.score} パワー）
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRankingPage;
