import React from "react";
import saveRewardPower from "../utils/saveRewardPower"; // ← 追加

const RewardPopup = ({ onClose, onReward }) => {
  const chanceType = getRandomChance(); // "chance", "big", "super"

  const handleReward = () => {
    const rewardAmount = getRandomReward(chanceType);
    onReward?.({ type: chanceType, amount: rewardAmount });
    saveRewardPower(rewardAmount); // ← Firestore に保存
    onClose();
  };

  const getButtonStyle = () => {
    switch (chanceType) {
      case "super":
        return "bg-purple-600 hover:bg-purple-700 text-white";
      case "big":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-yellow-400 hover:bg-yellow-500 text-black";
    }
  };

  const getButtonText = () => {
    switch (chanceType) {
      case "super":
        return "🟣 激アツ\n動画を見てpwゲット！1000pw出るかも";
      case "big":
        return "🔴 大チャンス\n動画を見てpwゲット！500pw出るかも";
      default:
        return "🟡 チャンス\n動画を見てpwゲット！200pw出るかも";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">🎁 ごほうびチャンス！</h2>
        <button
          onClick={handleReward}
          className={`${getButtonStyle()} whitespace-pre-line py-3 px-6 rounded text-lg font-bold mb-4 w-full`}
        >
          {getButtonText()}
        </button>
        <button
          onClick={() => {
            saveRewardPower(100); // ← 100pwだけ保存
            onReward?.({ type: "default", amount: 100 });
            onClose();
          }}
          className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          このまま終了（100pwだけ）
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;

// 🔽 以下ユーティリティ関数
function getRandomChance() {
  const rand = Math.random();
  if (rand < 0.1) return "super"; // 10% 激アツ
  if (rand < 0.4) return "big";   // 30% 大チャンス
  return "chance";               // 60% チャンス
}

function getRandomReward(type) {
  if (type === "super") {
    return Math.random() < 0.5 ? 500 : 1000;
  } else if (type === "big") {
    return Math.random() < 0.5 ? 300 : 500;
  } else {
    return Math.random() < 0.5 ? 100 : 200;
  }
}
