import React, { useEffect, useState } from "react";
import "./RewardPanel.css";

const RewardPanel = ({ onRewarded, combo = 0 }) => {
  const [rewardType, setRewardType] = useState(""); // "none", "ad"
  const [adRank, setAdRank] = useState(""); // "chance", "great", "ultra"
  const [rewardAmount, setRewardAmount] = useState(0);

  // 検 combo縺ｫ蠢懊§縺滓ｿ繧｢繝・｣懈ｭ｣邇・
  const getUltraChanceRate = () => {
    if (combo >= 20) return 0.3;
    if (combo >= 10) return 0.2;
    return 0.1;
  };

  useEffect(() => {
    const isAd = Math.random() < 1 / 3;
    setRewardType(isAd ? "ad" : "none");

    if (isAd) {
      const ultraRate = getUltraChanceRate();
      const r = Math.random();
      if (r < ultraRate) {
        setAdRank("ultra");
        setRewardAmount(Math.random() < 0.5 ? 500 : 1000);
      } else if (r < ultraRate + 0.3) {
        setAdRank("great");
        setRewardAmount(Math.random() < 0.5 ? 300 : 500);
      } else {
        setAdRank("chance");
        setRewardAmount(Math.random() < 0.5 ? 200 : 300);
      }
    }
  }, [combo]);

  const handleReward = () => {
    onRewarded(rewardAmount);
    if (adRank === "ultra") {
      const label = document.createElement("div");
      label.className = "reward-float";
      label.innerText = `+${rewardAmount}!!`;
      document.body.appendChild(label);
      setTimeout(() => label.remove(), 2000);
    }
  };

  const getButtonStyle = () => {
    switch (adRank) {
      case "ultra":
        return "bg-red-600 text-white animate-fire";
      case "great":
        return "bg-purple-500 text-white";
      case "chance":
      default:
        return "bg-yellow-400 text-black";
    }
  };

  const getButtonLabel = () => {
    switch (adRank) {
      case "ultra":
        return "櫨 豼繧｢繝・・繧ｿ繝ｳ 櫨";
      case "great":
        return "識 螟ｧ繝√Ε繝ｳ繧ｹ繝懊ち繝ｳ";
      case "chance":
      default:
        return "笨ｨ 繝√Ε繝ｳ繧ｹ繝懊ち繝ｳ";
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold mb-2">氏 蝣ｱ驟ｬ繧偵ご繝・ヨ縺励ｈ縺・ｼ・/h2>

      {rewardType === "none" && (
        <>
          <p className="text-green-600 mb-2">莉雁屓縺ｯ蠎・相縺ｪ縺励〒繝ｩ繝・く繝ｼ・・/p>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            onClick={() => onRewarded(100)}
          >
            +100 繝代Ρ繝ｼ繧貞女縺大叙繧・
          </button>
        </>
      )}

      {rewardType === "ad" && (
        <>
          <p className="text-blue-600 mb-2">脂 繝ｩ繝ｳ繧ｯ莉倥″繝懊・繝翫せ繝√Ε繝ｳ繧ｹ・・/p>
          <button
            className={`${getButtonStyle()} py-2 px-4 rounded text-lg font-bold hover:opacity-90`}
            onClick={handleReward}
          >
            {getButtonLabel()}・・{rewardAmount}・・
          </button>
        </>
      )}
    </div>
  );
};

export default RewardPanel;
