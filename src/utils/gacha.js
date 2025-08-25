// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
// utils/gacha.js ・医∪縺溘・繧ｳ繝ｳ繝昴・繝阪Φ繝亥・縺ｧ繧０K・・
export const rollGachaPoint = () => {
  const rand = Math.random();
  if (rand < 0.6) return 1;    // 60%
  else if (rand < 0.9) return 2; // 30%
  else return 5;               // 10%
};
