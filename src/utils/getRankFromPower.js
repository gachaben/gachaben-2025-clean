// src/utils/getRankFromPower.js

// パワーに応じてランク（b, a, s）を返す
export const getRankFromPower = (pw) => {
  if (pw >= 1100) {
    return "s"; // Sランク（神化ゾーン対応）
  } else if (pw >= 600) {
    return "a"; // Aランク（超越ゾーン対応）
  } else {
    return "b"; // Bランク（爆裂ゾーンどまり）
  }
};
