// assignTournamentRewards.js
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// 👑 設定（スコアキーや報酬ID）
const SCORE_KEY = "monthlyScore_202507";
const SPECIAL_TICKET_ID = "S202508";
const A_EGG_ID = "eggA001";

const assignTournamentRewards = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  const teams = {};

  // 🔍 データ整形：都道府県ごとのユーザーを分類
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const prefecture = data.prefecture;
    const score = data[SCORE_KEY] || 0;
    const name = data.name || "ななしさん";

    if (!prefecture || score <= 0) return;

    if (!teams[prefecture]) teams[prefecture] = [];
    teams[prefecture].push({
      uid: docSnap.id,
      name,
      score,
    });
  });

  // 🏆 上位3県を抽出（代表数を合わせる）
  const teamList = Object.entries(teams).map(([pref, members]) => {
    return {
      prefecture: pref,
      members: [...members].sort((a, b) => b.score - a.score),
    };
  });

  // 各都道府県の代表者数の最小値（全県の公平性）
  const minSize = Math.min(...teamList.map((t) => t.members.length));

  // チームごとの合計スコア（代表者数分）
  const rankedTeams = teamList
    .map((team) => {
      const topMembers = team.members.slice(0, minSize);
      const total = topMembers.reduce((sum, m) => sum + m.score, 0);
      return {
        ...team,
        totalScore: total,
        topMembers,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  // 🥇🥈🥉 上位3チーム
  const top3Prefectures = rankedTeams.slice(0, 3).map((team) => team.prefecture);

  // 🎁 ユーザーに報酬付与
  for (const team of rankedTeams) {
    const isTop3 = top3Prefectures.includes(team.prefecture);
    const rewardTargetCount = Math.ceil(team.members.length * 0.1); // 上位1割

    const topUsers = team.members
      .sort((a, b) => b.score - a.score)
      .slice(0, rewardTargetCount);

    for (const user of topUsers) {
      const userRef = doc(db, "users", user.uid);

      if (isTop3) {
        // 🏆 抽選チケットを付与
        await updateDoc(userRef, {
          specialTicket: SPECIAL_TICKET_ID,
        });
        console.log(`🎫 ${user.name} に抽選券（${SPECIAL_TICKET_ID}）を付与`);
      } else {
        // 🥚 Aランクの卵をプレゼント
        await updateDoc(userRef, {
          [`eggs.${A_EGG_ID}`]: true,
        });
        console.log(`🥚 ${user.name} に ${A_EGG_ID} を付与`);
      }
    }
  }

  console.log("✅ 報酬の付与が完了しました！");
};

export default assignTournamentRewards;
