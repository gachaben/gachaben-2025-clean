import { getDoc, doc } from "firebase/firestore";
import { db } from "./config"; // ← あなたの config.js に合わせて調整してください

export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};
