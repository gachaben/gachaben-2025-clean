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
    if (type === "chance") return "🎯 チャンスボタン！";
    if (type === "great") return "💥 大チャンスボタン！";
    if (type === "super") return "🔥 激アツボタン！！";
    return "";
  };

  const handleReward = () => {
    // 仮想の広告視聴後に報酬付与
    alert(`🎁 ${reward} パワーをゲット！`);
    onReward(reward); // 外部に報酬通知
    onClose(); // ポップアップを閉じる
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">🎉 ラッキーチャンス発生！</h2>
        <p className="mb-4 text-gray-700">動画を見れば最大 {reward} パワーがもらえる！</p>
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
          あとでにする
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
