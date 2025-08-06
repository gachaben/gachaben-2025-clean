// src/utils/updateEvolutionStage.js
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// 進化条件に応じて stage を更新
export const updateEvolutionStage = async (uid, itemId) => {
  const ref = doc(db, "userItemPowers", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  const data = snap.data();
  const item = data[itemId];
  if (!item) return false;

  const pw = item.pw ?? 0;
  let newStage = "egg";

  if (pw >= 1000) newStage = "premium";
  else if (pw >= 300) newStage = "adult";
  else if (pw >= 200) newStage = "pupa";
  else if (pw >= 100) newStage = "larva";

  const currentStage = item.stage ?? "unknown";

  if (currentStage !== newStage) {
    await updateDoc(ref, {
      [`${itemId}.stage`]: newStage
    });
    console.log(`✅ ${itemId} が ${newStage} に進化したよ！`);
    return true; // ← 進化したときだけ true を返す！
  }

  return false;
};
