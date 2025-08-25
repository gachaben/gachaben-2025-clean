// assignTournamentRewards.js
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/fbkit";

// 荘 險ｭ螳夲ｼ医せ繧ｳ繧｢繧ｭ繝ｼ繧・ｱ驟ｬID・・
const SCORE_KEY = "monthlyScore_202507";
const SPECIAL_TICKET_ID = "S202508";
const A_EGG_ID = "eggA001";

const assignTournamentRewards = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  const teams = {};

  // 剥 繝・・繧ｿ謨ｴ蠖｢・夐・驕灘ｺ懃恁縺斐→縺ｮ繝ｦ繝ｼ繧ｶ繝ｼ繧貞・鬘・
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const prefecture = data.prefecture;
    const score = data[SCORE_KEY] || 0;
    const name = data.name || "縺ｪ縺ｪ縺励＆繧・;

    if (!prefecture || score <= 0) return;

    if (!teams[prefecture]) teams[prefecture] = [];
    teams[prefecture].push({
      uid: docSnap.id,
      name,
      score,
    });
  });

  // 醇 荳贋ｽ・逵後ｒ謚ｽ蜃ｺ・井ｻ｣陦ｨ謨ｰ繧貞粋繧上○繧具ｼ・
  const teamList = Object.entries(teams).map(([pref, members]) => {
    return {
      prefecture: pref,
      members: [...members].sort((a, b) => b.score - a.score),
    };
  });

  // 蜷・・驕灘ｺ懃恁縺ｮ莉｣陦ｨ閠・焚縺ｮ譛蟆丞､・亥・逵後・蜈ｬ蟷ｳ諤ｧ・・
  const minSize = Math.min(...teamList.map((t) => t.members.length));

  // 繝√・繝縺斐→縺ｮ蜷郁ｨ医せ繧ｳ繧｢・井ｻ｣陦ｨ閠・焚蛻・ｼ・
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

  // ･・衍芋衍・荳贋ｽ・繝√・繝
  const top3Prefectures = rankedTeams.slice(0, 3).map((team) => team.prefecture);

  // 氏 繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ蝣ｱ驟ｬ莉倅ｸ・
  for (const team of rankedTeams) {
    const isTop3 = top3Prefectures.includes(team.prefecture);
    const rewardTargetCount = Math.ceil(team.members.length * 0.1); // 荳贋ｽ・蜑ｲ

    const topUsers = team.members
      .sort((a, b) => b.score - a.score)
      .slice(0, rewardTargetCount);

    for (const user of topUsers) {
      const userRef = doc(db, "users", user.uid);

      if (isTop3) {
        // 醇 謚ｽ驕ｸ繝√こ繝・ヨ繧剃ｻ倅ｸ・
        await updateDoc(userRef, {
          specialTicket: SPECIAL_TICKET_ID,
        });
        console.log(`辞 ${user.name} 縺ｫ謚ｽ驕ｸ蛻ｸ・・{SPECIAL_TICKET_ID}・峨ｒ莉倅ｸ餐);
      } else {
        // ･・A繝ｩ繝ｳ繧ｯ縺ｮ蜊ｵ繧偵・繝ｬ繧ｼ繝ｳ繝・
        await updateDoc(userRef, {
          [`eggs.${A_EGG_ID}`]: true,
        });
        console.log(`･・${user.name} 縺ｫ ${A_EGG_ID} 繧剃ｻ倅ｸ餐);
      }
    }
  }

  console.log("笨・蝣ｱ驟ｬ縺ｮ莉倅ｸ弱′螳御ｺ・＠縺ｾ縺励◆・・);
};

export default assignTournamentRewards;
