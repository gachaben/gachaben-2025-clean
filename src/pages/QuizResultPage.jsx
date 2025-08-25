import React, { useEffect } from "react";
import { auth, db } from "@/fbkit";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateEvolutionStage } from "../utils/updateEvolutionStage"; // 竊・霑ｽ蜉・・

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

      // 蛤繝代Ρ繝ｼ・・耳縺励・繧､繝ｳ繝亥刈邂・
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

      // 蛤蜊ｵ繧｢繧､繝・Β繧ｲ繝・ヨ・・gg001・・
      await addEggItem(uid, "egg001");

      // 蛤騾ｲ蛹悶せ繝・・繧ｸ縺ｮ譖ｴ譁ｰ・・gg001・・
      await updateEvolutionStage(uid, "egg001");

      alert("繝昴う繝ｳ繝茨ｼ・◆縺ｾ縺斐ｒ繧ｲ繝・ヨ縺励◆繧茨ｼ・);
    };

    handleResult();
  }, []);

  return (
    <div className="text-center mt-10">
      <h2 className="text-2xl font-bold">縺懊ｓ繧ゅｓ縺帙＞縺九＞・・/h2>
      <p className="mt-4">繝昴う繝ｳ繝医→縺溘∪縺斐ｒ繧ゅｉ縺｣縺溘ｈ縲懺沁・/p>
    </div>
  );
};

export default QuizResultPage;
