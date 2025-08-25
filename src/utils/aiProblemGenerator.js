// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
// src/utils/aiProblemGenerator.js

export function generateSampleProblems(grade, subject) {
  // 螳滄圀縺ｯAPI騾｣謳ｺ縲√％縺薙〒縺ｯ繧ｵ繝ｳ繝励Ν霑斐☆
  const samples = {
    "1蟷ｴ逕・: {
      縺輔ｓ縺吶≧: [
        { question: "繧翫ｓ縺斐′3縺薙√∩縺九ｓ縺・縺薙≠繧翫∪縺吶ゅ≠繧上○縺ｦ縺ｪ繧薙％・・, choices: ["3縺・, "4縺・, "5縺・, "6縺・], answer: "5縺・ },
        { question: "1縺九ｉ5縺ｾ縺ｧ縺ｮ縺九★縺ｮ縺ｪ縺九〒縲√＞縺｡縺ｰ繧灘､ｧ縺阪＞縺ｮ縺ｯ縺ｩ繧鯉ｼ・, choices: ["1", "3", "5", "2"], answer: "5" }
      ],
      縺薙￥縺・ [
        { question: "縲後・縺ｪ縲阪ｒ縺ｲ繧峨′縺ｪ縺ｧ 縺九＞縺ｦ縺ゅｋ縺ｮ縺ｯ縺ｩ繧鯉ｼ・, choices: ["縺ｯ縺ｪ", "繝上リ", "闃ｱ", "繝・], answer: "縺ｯ縺ｪ" },
        { question: "縲後≠縺九＞縺ｯ縺ｪ縲阪・縺ｪ縺九↓縺ゅｋ 縺・ｍ縺ｯ縺ｩ繧鯉ｼ・, choices: ["縺ゅ♀", "縺ゅ°", "縺ｿ縺ｩ繧・, "縺励ｍ"], answer: "縺ゅ°" }
      ]
    },
    "2蟷ｴ逕・: {
      縺輔ｓ縺吶≧: [
        { question: "9-4 縺ｯ縺・￥縺､・・, choices: ["3", "4", "5", "6"], answer: "5" },
        { question: "3ﾃ・ 縺ｯ縺ｩ繧鯉ｼ・, choices: ["5", "6", "7", "8"], answer: "6" }
      ]
    }
  };

  return samples[grade]?.[subject] || [
    { question: "縺薙・縺阪ｇ縺・°縺ｫ縺ｯ 縺ｾ縺 繧ゅｓ縺縺・′ 縺ゅｊ縺ｾ縺帙ｓ", choices: [], answer: "" }
  ];
}
