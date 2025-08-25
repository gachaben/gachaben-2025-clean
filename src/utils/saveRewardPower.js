// src/utils/saveRewardPower.js

import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { auth, db } from "@/fbkit";
import { format } from "date-fns";

const saveRewardPower = async (amount) => {
  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;
  const date = format(new Date(), "yyyy-MM-dd"); // 侁E "2025-07-05"
  const monthKey = format(new Date(), "yyyyMM"); // 侁E "202507"

  const userRef = doc(db, "users", uid);

  try {
    await updateDoc(userRef, {
      [`rewardPower_${monthKey}.total`]: increment(amount),
      [`rewardPower_${monthKey}.history`]: arrayUnion({
        date,
        amount,
      }),
    });

    console.log("✁EFirestoreに保存�E劁E", amount, "pw");
  } catch (error) {
    console.error("❁EFirestore保存エラー:", error);
  }
};

export default saveRewardPower;
