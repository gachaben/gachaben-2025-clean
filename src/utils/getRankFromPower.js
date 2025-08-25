// src/utils/getRankFromPower.js

// 繝代Ρ繝ｼ縺ｫ蠢懊§縺ｦ繝ｩ繝ｳ繧ｯ・・, a, s・峨ｒ霑斐☆
export const getRankFromPower = (pw) => {
  if (pw >= 1100) {
    return "s"; // S繝ｩ繝ｳ繧ｯ・育･槫喧繧ｾ繝ｼ繝ｳ蟇ｾ蠢懶ｼ・
  } else if (pw >= 600) {
    return "a"; // A繝ｩ繝ｳ繧ｯ・郁ｶ・ｶ翫だ繝ｼ繝ｳ蟇ｾ蠢懶ｼ・
  } else {
    return "b"; // B繝ｩ繝ｳ繧ｯ・育・陬ゅだ繝ｼ繝ｳ縺ｩ縺ｾ繧奇ｼ・
  }
};
