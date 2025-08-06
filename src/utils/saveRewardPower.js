// src/utils/saveRewardPower.js

import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { auth, db } from "../firebase";
import { format } from "date-fns";

const saveRewardPower = async (amount) => {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const date = format(new Date(), "yyyy-MM-dd"); // 例: "2025-07-05"
  const monthKey = format(new Date(), "yyyyMM"); // 例: "202507"

  const userRef = doc(db, "users", uid);

  try {
    await updateDoc(userRef, {
      [`rewardPower_${monthKey}.total`]: increment(amount),
      [`rewardPower_${monthKey}.history`]: arrayUnion({
        date,
        amount,
      }),
    });

    console.log("✅ Firestoreに保存成功:", amount, "pw");
  } catch (error) {
    console.error("❌ Firestore保存エラー:", error);
  }
};

export default saveRewardPower;
