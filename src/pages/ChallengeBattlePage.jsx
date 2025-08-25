import { auth, db } from "@/fbkit";
import { doc, getDoc, setDoc } from "firebase/firestore";

// 櫨 莉頑怦縺ｮ繧ｹ繧ｳ繧｢ID繧堤函謌撰ｼ井ｾ具ｼ嗄onthlyScore_202507・・
const getCurrentMonthScoreKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `monthlyScore_${y}${m}`; // 萓具ｼ嗄onthlyScore_202507
};
// ｧ Firestore縺ｫ繧ｹ繧ｳ繧｢繧貞刈邂励☆繧矩未謨ｰ
const addMonthlyScore = async (points) => {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const scoreKey = getCurrentMonthScoreKey();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  let currentScore = 0;
  if (userSnap.exists()) {
    currentScore = userSnap.data()[scoreKey] || 0;
  }

  await setDoc(userRef, { [scoreKey]: currentScore + points }, { merge: true });
};





// 蝠城｡後′豁｣隗｣縺励◆譎ゅ・蜃ｦ逅・
const handleCorrectAnswer = async () => {
  // 豁｣隗｣・∝ｾ礼せ +100 繝代Ρ繝ｼ
  await addMonthlyScore(100); // 竊舌％縺薙〒繧ｹ繧ｳ繧｢蜉邂暦ｼ・

  alert("縺帙＞縺九＞・・繝代Ρ繝ｼ +100");
};
