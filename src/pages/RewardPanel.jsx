import React, { useEffect, useState } from "react";
import "./RewardPanel.css";

const RewardPanel = ({ onRewarded, combo = 0 }) => {
  const [rewardType, setRewardType] = useState(""); // "none", "ad"
  const [adRank, setAdRank] = useState(""); // "chance", "great", "ultra"
  const [rewardAmount, setRewardAmount] = useState(0);

  // 🌟 comboに応じた激アツ補正率
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
        return "🔥 激アツボタン 🔥";
      case "great":
        return "🎯 大チャンスボタン";
      case "chance":
      default:
        return "✨ チャンスボタン";
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow text-center max-w-md mx-auto mt-4">
      <h2 className="text-xl font-bold mb-2">🎁 報酬をゲットしよう！</h2>

      {rewardType === "none" && (
        <>
          <p className="text-green-600 mb-2">今回は広告なしでラッキー！</p>
          <button
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            onClick={() => onRewarded(100)}
          >
            +100 パワーを受け取る
          </button>
        </>
      )}

      {rewardType === "ad" && (
        <>
          <p className="text-blue-600 mb-2">🎉 ランク付きボーナスチャンス！</p>
          <button
            className={`${getButtonStyle()} py-2 px-4 rounded text-lg font-bold hover:opacity-90`}
            onClick={handleReward}
          >
            {getButtonLabel()}（+{rewardAmount}）
          </button>
        </>
      )}
    </div>
  );
};

export default RewardPanel;
