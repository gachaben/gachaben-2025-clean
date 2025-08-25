// 塘 src/utils/initializeUserItems.js

import { doc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit";

// 繝ｦ繝ｼ繧ｶ繝ｼ縺ｫ繧｢繧､繝・ΒID繧定・蜍慕匳骭ｲ・・gg蠖｢蠑上〒縺ｯ縺ｪ縺輯/A/B蠖｢蠑擾ｼ・
export const initializeUserItems = async (uid) => {
  const items = [
    "2508_A_001_herakuresu_stage1",
    "2508_A_002_ageha_stage1",
    "2508_A_003_hati_stage1"
  ];

  await setDoc(
    doc(db, "users", uid),
    { items },
    { merge: true }
  );

  console.log("蛻晄悄蛹門ｮ御ｺ・＠縺ｾ縺励◆・・);
};
