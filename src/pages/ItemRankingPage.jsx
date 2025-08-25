import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/fbkit";

const ItemRankingPage = () => {
  const { itemId } = useParams(); // 萓・ "egg001"
  const [ranking, setRanking] = useState([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const snapshot = await getDocs(collection(db, "userItemPowers"));
      const scores = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const item = data.items?.[itemId];
        if (item) {
          scores.push({
            uid: doc.id,
            pw: item.pw,
          });
        }
      });

      // 繝代Ρ繝ｼ鬆・↓荳ｦ縺ｳ譖ｿ縺茨ｼ磯剄鬆・ｼ・
      scores.sort((a, b) => b.pw - a.pw);

      // 荳贋ｽ・0%縺ｮ蠅・阜繧定ｨ育ｮ・
      const topPercent = Math.ceil(scores.length * 0.1);
      const withRank = scores.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isTop10: index < topPercent,
      }));

      setRanking(withRank);
    };

    fetchRanking();
  }, [itemId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">投 繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ・嘴itemId}</h2>
      <ul className="space-y-2">
        {ranking.map((entry) => (
          <li
            key={entry.uid}
            className={`p-2 rounded-lg ${
              entry.isTop10 ? "bg-yellow-200 font-bold" : "bg-gray-100"
            }`}
          >
            遵 {entry.rank}菴搾ｼ嘴entry.uid.slice(0, 6)}...・・entry.pw} pw・・
            {entry.isTop10 && " 醇"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ItemRankingPage;
