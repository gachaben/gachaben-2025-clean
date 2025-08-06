import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 例：monthlyScore_202507
};

const TeamRankingPage = () => {
  const [ranking, setRanking] = useState([]);
  const [minTeamSize, setMinTeamSize] = useState(0);

  useEffect(() => {
    const fetchTeamRanking = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const scoreKey = getCurrentMonthScoreKey();

      const teams = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const prefecture = data.prefecture;
        const name = data.name || "ななしさん";
        const score = data[scoreKey] || 0;

        if (!prefecture) return;

        if (!teams[prefecture]) teams[prefecture] = [];
        teams[prefecture].push({ name, score });
      });

      // 最小チームサイズを決定
      const minSize = Math.min(...Object.values(teams).map(team => team.length));
      setMinTeamSize(minSize);

      // 各県の上位 minSize 人のスコアを合計
      const rankedTeams = Object.entries(teams).map(([prefecture, members]) => {
        const sorted = members.sort((a, b) => b.score - a.score).slice(0, minSize);
        const totalScore = sorted.reduce((sum, user) => sum + user.score, 0);
        return { prefecture, totalScore, members: sorted };
      });

      // スコア順にソート
      rankedTeams.sort((a, b) => b.totalScore - a.totalScore);

      setRanking(rankedTeams);
    };

    fetchTeamRanking();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 団体戦ランキング（代表{minTeamSize}人）</h2>
      <ul>
        {ranking.map((team, index) => (
          <li key={team.prefecture} className="mb-4">
            <div className="font-bold text-lg">
              {index + 1}位：{team.prefecture}（合計 {team.totalScore} パワー）
            </div>
            <ul className="pl-4 text-sm text-gray-600">
              {team.members.map((user, i) => (
                <li key={i}>
                  {i + 1}. {user.name}（{user.score}）
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamRankingPage;
