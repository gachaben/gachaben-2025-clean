// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
// src/lib/getMistakes.js
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

/**
 * 繝ｭ繧ｰ繧､繝ｳ荳ｭ繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ髢馴＆縺・ｱ･豁ｴ繧貞叙蠕・
 * 縺ｾ縺・userId 縺ｧ讀懃ｴ｢・域立莠呈鋤・峨・莉ｶ縺ｪ繧・uid 縺ｧ繧よ､懃ｴ｢縺吶ｋ繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ
 */
export async function getMistakes(userId) {
  if (!userId) throw new Error("getMistakes: userId is required");

  // 1) 譌ｧ莠呈鋤: userId 縺ｧ蜿門ｾ・
  const q1 = query(
    collection(db, "mistakes"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap1 = await getDocs(q1);
  if (!snap1.empty) {
    return snap1.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // 2) 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: uid 縺ｧ蜿門ｾ・
  const q2 = query(
    collection(db, "mistakes"),
    where("uid", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap2 = await getDocs(q2);
  return snap2.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
