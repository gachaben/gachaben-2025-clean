import React, { useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { addEggItem } from "../utils/addEggItem";
import { updateEvolutionStage } from "../utils/updateEvolutionStage"; // ← 追加！

const QuizResultPage = () => {
  useEffect(() => {
    const handleResult = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const uid = user.uid;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const oshiId = userSnap.data().oshi || "unknown";

      // 🔸パワー＆推しポイント加算
      const itemRef = doc(db, "userItemPowers", uid);
      const itemSnap = await getDoc(itemRef);

      if (itemSnap.exists()) {
        const current = itemSnap.data();
        const currentPW = current.pw ?? 0;
        const currentPoint = current.oshiPoint ?? 0;

        await updateDoc(itemRef, {
          pw: currentPW + 20,
          oshiPoint: currentPoint + 10,
          oshi: oshiId,
        });
      } else {
        await setDoc(itemRef, {
          pw: 20,
          oshiPoint: 10,
          oshi: oshiId,
        });
      }

      // 🔸卵アイテムゲット（egg001）
      await addEggItem(uid, "egg001");

      // 🔸進化ステージの更新（egg001）
      await updateEvolutionStage(uid, "egg001");

      alert("ポイント＆たまごをゲットしたよ！");
    };

    handleResult();
  }, []);

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold">ぜんもんせいかい！</h2>
      <p className="mt-4">ポイントとたまごをもらったよ〜🎁</p>
    </div>
  );
};

export default QuizResultPage;
