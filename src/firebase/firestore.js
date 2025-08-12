import { getFirestore, connectFirestoreEmulator, getDoc, doc } from "firebase/firestore";
import { app } from "./config"; // ← config.js で initializeApp 済みのやつ

const db = getFirestore(app);

// ローカル開発時のみエミュ接続
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("🔥 Firestore Emulator 接続中");
  } catch (err) {
    console.error("Emulator 接続失敗:", err);
  }
}

// ユーザーデータ取得
export const getUserData = async (uid) => {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

export { db };
