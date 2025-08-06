// src/utils/updateItemStage.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateItemStage = async (uid, itemId, newStage) => {
  try {
    const itemRef = doc(db, "userItemPowers", uid);
    await updateDoc(itemRef, {
      [`items.${itemId}.stage`]: newStage,
    });
    console.log("ステージを更新しました！");
  } catch (error) {
    console.error("ステージの更新に失敗しました:", error);
  }
};
