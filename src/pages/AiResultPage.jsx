// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "@/fbkit";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const AiResultPage = () => {
  const location = useLocation();
  const { grade, subject, unit, topic } = location.state || {};

  useEffect(() => {
    const saveToFirestore = async () => {
      if (!grade || !subject || !unit || !topic) return;

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "aiProblemLogs"), {
        createdAt: new Date(),
        grade,
        subject,
        unit,
        topic,
        uid: user.uid
      });
    };

    saveToFirestore();
  }, [grade, subject, unit, topic]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">笨・險ｺ譁ｭ邨先棡</h2>
      <p className="mb-2">蟄ｦ蟷ｴ・嘴grade}</p>
      <p className="mb-4">闍ｦ謇九↑謨咏ｧ托ｼ嘴subject}</p>

      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="font-semibold">測 菫晁ｭｷ閠・・譁ｹ縺ｸ・・/p>
        <p>
          縺雁ｭ舌＆縺ｾ縺ｯ縲鶏unit}縲阪↓闍ｦ謇区э隴倥′縺ゅｋ繧医≧縺ｧ縺吶・
          <br />
          縺薙・蛯ｾ蜷代↓縺ゅｏ縺帙※縲、I縺檎音險灘撫鬘後ｒ菴懈・縺吶ｋ縺薙→縺後〒縺阪∪縺吶・
        </p>
      </div>

      <div className="flex gap-4 mb-8">
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          ､・AI縺ｧ迚ｹ險灘撫鬘後ｒ菴懈・・・00蜀・ｼ・
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          ､・AI縺ｧ迚ｹ險灘撫鬘後ｒ菴懈・・・00蜀・ｼ・
        </button>
      </div>

      <h3 className="text-lg font-bold mb-2">誠 縺ｨ縺｣縺上ｓ繧ゅｓ縺縺・/h3>
      <p className="text-sm border p-4">
        1. 縺薙・縺阪ｇ縺・°縺ｫ縺ｯ 縺ｾ縺 繧ゅｓ縺縺・′ 縺ゅｊ縺ｾ縺帙ｓ
      </p>
    </div>
  );
};

export default AiResultPage;

