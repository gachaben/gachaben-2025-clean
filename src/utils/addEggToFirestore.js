// 🔧 Firebase設定を読み込み
import { db } from "../legacy_deprecated/firebase"; // ← 自分のfirebase設定ファイルのパスに変更
import { collection, addDoc, Timestamp } from "firebase/firestore";

// 🥚 Firestoreに卵データを追加する関数
export const addEggToFirestore = async ({ eggId, imageName, stage, name, uid }) => {
  try {
    const docRef = await addDoc(collection(db, "ownedEggs"), {
      eggId,
      imageName,
      stage,
      name,
      uid,
      timestamp: Timestamp.now(),
    });

    console.log("✅ 卵データを追加しました！ID:", docRef.id);
  } catch (error) {
    console.error("❌ 卵データの追加に失敗:", error);
  }
};
