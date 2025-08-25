// src/components/RewardPopup.jsx
import React, { useEffect, useState } from "react";

const getRandomType = () => {
  const rand = Math.random();
  if (rand < 0.6) return "chance"; // 60%
  if (rand < 0.9) return "great"; // 30%
  return "super"; // 10%
};

const getRewardAmount = (type) => {
  const rand = Math.random();
  if (type === "chance") {
    return rand < 0.5 ? 200 : 300;
  } else if (type === "great") {
    return rand < 0.5 ? 300 : 500;
  } else if (type === "super") {
    return rand < 0.5 ? 500 : 1000;
  }
};

const RewardPopup = ({ onClose, onReward }) => {
  const [type, setType] = useState("");
  const [reward, setReward] = useState(0);

  useEffect(() => {
    const t = getRandomType();
    const r = getRewardAmount(t);
    setType(t);
    setReward(r);
  }, []);

  const getButtonStyle = () => {
    if (type === "chance")
      return "bg-yellow-400 hover:bg-yellow-500 text-black";
    if (type === "great")
      return "bg-orange-500 hover:bg-orange-600 text-white";
    if (type === "super")
      return "bg-red-600 hover:bg-red-700 text-white font-bold border-2 border-yellow-300 animate-bounce";
    return "";
  };

  const getButtonLabel = () => {
    if (type === "chance") return "識 繝√Ε繝ｳ繧ｹ繝懊ち繝ｳ・・;
    if (type === "great") return "徴 螟ｧ繝√Ε繝ｳ繧ｹ繝懊ち繝ｳ・・;
    if (type === "super") return "櫨 豼繧｢繝・・繧ｿ繝ｳ・・ｼ・;
    return "";
  };

  const handleReward = () => {
    // 莉ｮ諠ｳ縺ｮ蠎・相隕冶・蠕後↓蝣ｱ驟ｬ莉倅ｸ・
    alert(`氏 ${reward} 繝代Ρ繝ｼ繧偵ご繝・ヨ・～);
    onReward(reward); // 螟夜Κ縺ｫ蝣ｱ驟ｬ騾夂衍
    onClose(); // 繝昴ャ繝励い繝・・繧帝哩縺倥ｋ
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">脂 繝ｩ繝・く繝ｼ繝√Ε繝ｳ繧ｹ逋ｺ逕滂ｼ・/h2>
        <p className="mb-4 text-gray-700">蜍慕判繧定ｦ九ｌ縺ｰ譛螟ｧ {reward} 繝代Ρ繝ｼ縺後ｂ繧峨∴繧具ｼ・/p>
        <button
          className={`px-4 py-2 rounded ${getButtonStyle()} mb-4 w-full`}
          onClick={handleReward}
        >
          {getButtonLabel()}
        </button>
        <button
          className="text-sm text-gray-500 hover:underline"
          onClick={onClose}
        >
          縺ゅ→縺ｧ縺ｫ縺吶ｋ
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
