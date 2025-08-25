// src/utils/evolveItem.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/fbkit";
import { getRandomStageUp } from "./getRandomStageUp";
import { getZoneByPower } from "./getZoneByPower";
import { getRankFromPower } from "./getRankFromPower"; // 竊・縺薙ｌ譁ｰ隕上〒蠢・ｦ√↑繧我ｽ懊ｋ

export const evolveItem = async (uid, itemId, adType = "none") => {
  const userRef = doc(db, "userItemPowers", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const item = data.items?.[itemId] || { pw: 0, stage: "stage1" };

  // 笨・騾ｲ蛹夜㍼繧呈ｱｺ螳・
  let addPw = 100;
  if (adType === "5s") {
    addPw = Math.random() < 0.2 ? 200 : 100;
  } else if (adType === "10s") {
    addPw = Math.random() < 0.4 ? 200 : 100;
  } else if (adType === "60s") {
    const r = Math.random();
    addPw = r < 0.1 ? 300 : r < 0.7 ? 200 : 100;
  }

  // 笨・繝ｩ繝ｳ繧ｯ蛻､螳夂畑縺ｫ rank 繧呈ｱｺ螳夲ｼ亥・譛殫w縺九ｉ・・
  const basePw = item.pw;
  let rank = "b";
  if (basePw >= 1100) {
    rank = "s";
  } else if (basePw >= 600) {
    rank = "a";
  }

  // 笨・繝ｩ繝ｳ繧ｯ縺斐→縺ｮ譛螟ｧpw荳企剞
  const rankLimit = {
    b: basePw + 500,
    a: basePw + 1000,
    s: basePw + 1500,
  };

  const maxPw = rankLimit[rank];
  const newPw = Math.min(basePw + addPw, maxPw);

  // 笨・繧ｹ繝・・繧ｸ繧るｲ蛹悶＆縺帙ｋ・・etRandomStageUp髢｢謨ｰ縺ｧ・・
  const newStage = getRandomStageUp(item.stage);

  // 笨・Firestore縺ｫ菫晏ｭ・
  await updateDoc(userRef, {
    [`items.${itemId}`]: {
      pw: newPw,
      stage: newStage,
    },
  });
};
