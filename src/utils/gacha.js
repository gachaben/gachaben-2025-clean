// utils/gacha.js （またはコンポーネント内でもOK）
export const rollGachaPoint = () => {
  const rand = Math.random();
  if (rand < 0.6) return 1;    // 60%
  else if (rand < 0.9) return 2; // 30%
  else return 5;               // 10%
};
