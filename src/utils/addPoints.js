import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/fbkit"; // 竊・繝代せ縺ｯ迺ｰ蠅・↓蜷医ｏ縺帙※・・

export async function addPoints(uid, amount) {
  const userRef = doc(db, "users", uid);
  try {
    await updateDoc(userRef, {
      points: increment(amount),
    });
    console.log(`笨・${amount}繝昴う繝ｳ繝亥刈邂励＠縺ｾ縺励◆`);
  } catch (error) {
    console.error("笶・繝昴う繝ｳ繝亥刈邂励お繝ｩ繝ｼ:", error);
  }
}
