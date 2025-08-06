import React, { useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase";

const AwardTop10PrefecturesPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAward = async () => {
    setLoading(true);
    setMessage("ランキング集計中...");

    // 全ユーザー取得
    const snapshot = await getDocs(collection(db, "users"));
    const allUsers = snapshot.docs.map((docSnap) => ({
      uid: docSnap.id,
      ...docSnap.data(),
    }));

    // ✅ 都道府県ごとの合計スコア集計
    const prefTotals = {};
    const scoreKey = getCurrentMonthScoreKey();

    allUsers.forEach((user) => {
      const pref = user.prefecture;
      const score = user[scoreKey] || 0;
      if (!prefTotals[pref]) prefTotals[pref] = 0;
      prefTotals[pref] += score;
    });

    // ✅ 上位10都道府県を抽出
    const top10Prefs = Object.entries(prefTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pref]) => pref);

    // ✅ 各上位県について、スコア順で並べて10%にバッジ
    let totalAwarded = 0;

    for (const pref of top10Prefs) {
      const usersInPref = allUsers
        .filter((u) => u.prefecture === pref)
        .sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0));

      const top10PercentCount = Math.ceil(usersInPref.length * 0.1);

      for (let i = 0; i < top10PercentCount; i++) {
        const user = usersInPref[i];
        const userRef = doc(db, "users", user.uid);

        const badge =
          i === 0
            ? `🥇 ${pref} MVP（7月）`
            : `🎖️ ${pref} ナイスプレイヤー（7月）`;

        await setDoc(
          userRef,
          {
            badgeList: arrayUnion(badge),
          },
          { merge: true }
        );
        totalAwarded++;
      }
    }

    setMessage(`✅ ${totalAwarded}人にバッジを付与しました`);
    setLoading(false);
  };

  const getCurrentMonthScoreKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `monthlyScore_${y}${m}`;
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🏆 上位10県のベストプレイヤー表彰</h2>
      <button
        onClick={handleAward}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 transition"
      >
        {loading ? "実行中..." : "バッジを付与する"}
      </button>
      {message && <p className="mt-4 text-green-700 font-bold">{message}</p>}
    </div>
  );
};

export default AwardTop10PrefecturesPage;
