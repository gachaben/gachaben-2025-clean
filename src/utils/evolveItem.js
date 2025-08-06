// src/utils/evolveItem.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getRandomStageUp } from "./getRandomStageUp";
import { getZoneByPower } from "./getZoneByPower";
import { getRankFromPower } from "./getRankFromPower"; // ← これ新規で必要なら作る

export const evolveItem = async (uid, itemId, adType = "none") => {
  const userRef = doc(db, "userItemPowers", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const item = data.items?.[itemId] || { pw: 0, stage: "stage1" };

  // ✅ 進化量を決定
  let addPw = 100;
  if (adType === "5s") {
    addPw = Math.random() < 0.2 ? 200 : 100;
  } else if (adType === "10s") {
    addPw = Math.random() < 0.4 ? 200 : 100;
  } else if (adType === "60s") {
    const r = Math.random();
    addPw = r < 0.1 ? 300 : r < 0.7 ? 200 : 100;
  }

  // ✅ ランク判定用に rank を決定（初期pwから）
  const basePw = item.pw;
  let rank = "b";
  if (basePw >= 1100) {
    rank = "s";
  } else if (basePw >= 600) {
    rank = "a";
  }

  // ✅ ランクごとの最大pw上限
  const rankLimit = {
    b: basePw + 500,
    a: basePw + 1000,
    s: basePw + 1500,
  };

  const maxPw = rankLimit[rank];
  const newPw = Math.min(basePw + addPw, maxPw);

  // ✅ ステージも進化させる（getRandomStageUp関数で）
  const newStage = getRandomStageUp(item.stage);

  // ✅ Firestoreに保存
  await updateDoc(userRef, {
    [`items.${itemId}`]: {
      pw: newPw,
      stage: newStage,
    },
  });
};
