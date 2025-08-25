// src/utils/gachaReward.js

// 蝣ｱ驟ｬ蛟呵｣懶ｼ・w 縺ｨ 繝√Ε繝ｳ繧ｹ繧ｫ繝ｼ繝峨ｒ縺斐■繧・∪縺懊↓・・
const rewardPool = [
  { type: "pw", value: 100 },
  { type: "pw", value: 200 },
  { type: "pw", value: 300 },
  { type: "pw", value: 500 },
  { type: "card", value: "縺・■縺偵″縺ｲ縺｣縺輔▽" },
  { type: "card", value: "繝繝｡繝ｼ繧ｸ縺九＞縺ｲ" },
  { type: "card", value: "繝繝｡繝ｼ繧ｸ繧｢繝・・" },
  { type: "card", value: "縺ｦ縺阪ｒ繧医ｏ繧峨○繧・ },
  { type: "pw", value: 400 },
  { type: "card", value: "縺薙≧縺偵″2縺九＞" },
];

// 繝ｩ繝ｳ繝繝縺ｧ1縺､驕ｸ縺ｶ髢｢謨ｰ
export const getRandomReward = () => {
  const index = Math.floor(Math.random() * rewardPool.length);
  return rewardPool[index];
};
