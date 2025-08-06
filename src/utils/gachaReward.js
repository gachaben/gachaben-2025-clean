// src/utils/gachaReward.js

// 報酬候補（pw と チャンスカードをごちゃまぜに）
const rewardPool = [
  { type: "pw", value: 100 },
  { type: "pw", value: 200 },
  { type: "pw", value: 300 },
  { type: "pw", value: 500 },
  { type: "card", value: "いちげきひっさつ" },
  { type: "card", value: "ダメージかいひ" },
  { type: "card", value: "ダメージアップ" },
  { type: "card", value: "てきをよわらせる" },
  { type: "pw", value: 400 },
  { type: "card", value: "こうげき2かい" },
];

// ランダムで1つ選ぶ関数
export const getRandomReward = () => {
  const index = Math.floor(Math.random() * rewardPool.length);
  return rewardPool[index];
};
