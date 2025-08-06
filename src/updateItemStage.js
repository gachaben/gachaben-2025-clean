import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const updateItemStage = async (docId, nextStage) => {
  const itemRef = doc(db, "userItemPowers", docId);
  await updateDoc(itemRef, {
    stage: nextStage,
  });
};
