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
        const name = data.name || "縺ｪ縺ｪ縺励＆繧・;
        const score = data[scoreKey] || 0;

        if (!prefecture) return;

        if (!teams[prefecture]) teams[prefecture] = [];
        teams[prefecture].push({ name, score });
      });

      // 譛蟆上メ繝ｼ繝繧ｵ繧､繧ｺ繧呈ｱｺ螳・
      const minSize = Math.min(...Object.values(teams).map(team => team.length));
      setMinTeamSize(minSize);

      // 蜷・恁縺ｮ荳贋ｽ・minSize 莠ｺ縺ｮ繧ｹ繧ｳ繧｢繧貞粋險・
      const rankedTeams = Object.entries(teams).map(([prefecture, members]) => {
        const sorted = members.sort((a, b) => b.score - a.score).slice(0, minSize);
        const totalScore = sorted.reduce((sum, user) => sum + user.score, 0);
        return { prefecture, totalScore, members: sorted };
      });

      // 繧ｹ繧ｳ繧｢鬆・↓繧ｽ繝ｼ繝・
      rankedTeams.sort((a, b) => b.totalScore - a.totalScore);

      setRanking(rankedTeams);
    };

    fetchTeamRanking();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">醇 蝗｣菴捺姶繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ・井ｻ｣陦ｨ{minTeamSize}莠ｺ・・/h2>
      <ul>
        {ranking.map((team, index) => (
          <li key={team.prefecture} className="mb-4">
            <div className="font-bold text-lg">
              {index + 1}菴搾ｼ嘴team.prefecture}・亥粋險・{team.totalScore} 繝代Ρ繝ｼ・・
            </div>
            <ul className="pl-4 text-sm text-gray-600">
              {team.members.map((user, i) => (
                <li key={i}>
                  {i + 1}. {user.name}・・user.score}・・
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
