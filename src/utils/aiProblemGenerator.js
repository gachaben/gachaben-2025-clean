// src/utils/aiProblemGenerator.js

export function generateSampleProblems(grade, subject) {
  // 実際はAPI連携、ここではサンプル返す
  const samples = {
    "1年生": {
      さんすう: [
        { question: "りんごが3こ、みかんが2こあります。あわせてなんこ？", choices: ["3こ", "4こ", "5こ", "6こ"], answer: "5こ" },
        { question: "1から5までのかずのなかで、いちばん大きいのはどれ？", choices: ["1", "3", "5", "2"], answer: "5" }
      ],
      こくご: [
        { question: "「はな」をひらがなで かいてあるのはどれ？", choices: ["はな", "ハナ", "花", "ハ"], answer: "はな" },
        { question: "「あかいはな」のなかにある いろはどれ？", choices: ["あお", "あか", "みどり", "しろ"], answer: "あか" }
      ]
    },
    "2年生": {
      さんすう: [
        { question: "9-4 はいくつ？", choices: ["3", "4", "5", "6"], answer: "5" },
        { question: "3×2 はどれ？", choices: ["5", "6", "7", "8"], answer: "6" }
      ]
    }
  };

  return samples[grade]?.[subject] || [
    { question: "このきょうかには まだ もんだいが ありません", choices: [], answer: "" }
  ];
}
