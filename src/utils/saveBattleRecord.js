// 📄 src/utils/saveBattleRecord.js
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveBattleRecord = async (uid, data) => {
  try {
    await addDoc(collection(db, "battleRecords", uid, "records"), {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("バトル記録の保存に失敗:", error);
  }
};
