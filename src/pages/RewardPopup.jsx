import React from "react";
import saveRewardPower from "../utils/saveRewardPower"; // 竊・霑ｽ蜉

const RewardPopup = ({ onClose, onReward }) => {
  const chanceType = getRandomChance(); // "chance", "big", "super"

  const handleReward = () => {
    const rewardAmount = getRandomReward(chanceType);
    onReward?.({ type: chanceType, amount: rewardAmount });
    saveRewardPower(rewardAmount); // 竊・Firestore 縺ｫ菫晏ｭ・
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
        return "泪 豼繧｢繝Ыn蜍慕判繧定ｦ九※pw繧ｲ繝・ヨ・・000pw蜃ｺ繧九°繧・;
      case "big":
        return "閥 螟ｧ繝√Ε繝ｳ繧ｹ\n蜍慕判繧定ｦ九※pw繧ｲ繝・ヨ・・00pw蜃ｺ繧九°繧・;
      default:
        return "泯 繝√Ε繝ｳ繧ｹ\n蜍慕判繧定ｦ九※pw繧ｲ繝・ヨ・・00pw蜃ｺ繧九°繧・;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-xl font-bold mb-4">氏 縺斐⊇縺・・繝√Ε繝ｳ繧ｹ・・/h2>
        <button
          onClick={handleReward}
          className={`${getButtonStyle()} whitespace-pre-line py-3 px-6 rounded text-lg font-bold mb-4 w-full`}
        >
          {getButtonText()}
        </button>
        <button
          onClick={() => {
            saveRewardPower(100); // 竊・100pw縺縺台ｿ晏ｭ・
            onReward?.({ type: "default", amount: 100 });
            onClose();
          }}
          className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          縺薙・縺ｾ縺ｾ邨ゆｺ・ｼ・00pw縺縺托ｼ・
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;

// 反 莉･荳九Θ繝ｼ繝・ぅ繝ｪ繝・ぅ髢｢謨ｰ
function getRandomChance() {
  const rand = Math.random();
  if (rand < 0.1) return "super"; // 10% 豼繧｢繝・
  if (rand < 0.4) return "big";   // 30% 螟ｧ繝√Ε繝ｳ繧ｹ
  return "chance";               // 60% 繝√Ε繝ｳ繧ｹ
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
