// src/pages/GachaResultPage.jsx

import React, { useEffect, useState } from "react";
import { auth, db } from "@/fbkit";
import { doc, getDoc } from "firebase/firestore";
import { getRandomReward } from "../utils/gachaReward"; // 竊・繧ｬ繝√Ε蝣ｱ驟ｬ髢｢謨ｰ・亥挨騾比ｽ懈・縺励※縺ｭ・・

const GachaResultPage = () => {
  const [reward, setReward] = useState(null);
  const [oshi, setOshi] = useState("nyan"); // 繝・ヵ繧ｩ繝ｫ繝茨ｼ医↓繧・ｓ・・
  const [showRetry, setShowRetry] = useState(false);

  // 蛤 繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ謗ｨ縺励く繝｣繝ｩ繧貞叙蠕・
  useEffect(() => {
    const fetchOshi = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setOshi(data.oshi || "nyan");
      }
    };
    fetchOshi();
  }, []);

  // 蛤 蛻晏屓繧ｬ繝√Ε邨先棡繧定｡ｨ遉ｺ
  useEffect(() => {
    const reward = getRandomReward(); // 繝ｩ繝ｳ繝繝蝣ｱ驟ｬ髢｢謨ｰ・医メ繝｣繝ｳ繧ｹ繧ｫ繝ｼ繝・or pw・・
    setReward(reward);
  }, []);

  // 蛤 蜀肴歓驕ｸ逕ｨ
  const handleRetry = async () => {
    // 莉ｮ縺ｮ蠎・相隕冶・蜃ｦ逅・ｼ医≠縺ｨ縺ｧ蟾ｮ縺玲崛縺・K・・
    const confirmed = window.confirm("蠎・相繧偵＆縺・＃縺ｾ縺ｧ縺ｿ縺ｾ縺励◆縺具ｼ・);
    if (confirmed) {
      const reward = getRandomReward();
      setReward(reward);
      setShowRetry(false); // 2蝗樒岼莉･髯阪・辟｡蜉ｹ
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">脂 繧ｬ繝√Ε縺代▲縺・脂</h2>

      {reward && (
        <div className="mb-4">
          <p className="text-lg">痩 繧ゅｉ縺｣縺溘ｂ縺ｮ・嘴reward.label}</p>
        </div>
      )}

      {/* 蛤 謗ｨ縺励く繝｣繝ｩ縺ｮ譯亥・繧ｻ繝ｪ繝・*/}
      {showRetry && (
        <div className="mb-4">
          <img
            src={`/images/oshi/${oshi}.png`}
            alt="謗ｨ縺励く繝｣繝ｩ"
            className="w-32 h-32 mx-auto"
          />
          <p className="mt-2 font-bold">
            縲交沁ｦ 縺ｩ縺・′繧偵∩縺溘ｉ縲√ｂ縺・＞縺｣縺九＞ 繧ｬ繝√Ε縺・縺ｲ縺代ｋ繧薙□縺｣縺ｦ・√・
          </p>
        </div>
      )}

      {/* 蛤 蜀肴歓驕ｸ繝懊ち繝ｳ */}
      {!showRetry ? (
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => setShowRetry(true)}
        >
          示 縺ｩ縺・′繧偵∩縺ｦ 繧ゅ≧縺・▲縺九＞ 繧ｬ繝√Ε・・
        </button>
      ) : (
        <button
          className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
          onClick={handleRetry}
        >
          笨・縺輔＞縺斐∪縺ｧ隕九◆繧茨ｼ√ぎ繝√Ε繧ゅ≧縺・▲縺九＞・・
        </button>
      )}
    </div>
  );
};

export default GachaResultPage;
