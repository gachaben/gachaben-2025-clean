// src/utils/getRandomStageUp.js

// 繝ｩ繝ｳ繝繝縺ｫ騾ｲ蛹悶せ繝・・繧ｸ繧呈ｱｺ螳壹☆繧矩未謨ｰ
export const getRandomStageUp = (currentStage) => {
  const stages = ["stage1", "stage2", "stage3", "stage4"];

  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= stages.length - 1) {
    return currentStage; // 騾ｲ蛹悶〒縺阪↑縺・ｴ蜷医・縺昴・縺ｾ縺ｾ
  }

  // 1縲・谿ｵ髫朱ｲ蛹悶ｒ繝ｩ繝ｳ繝繝縺ｫ豎ｺ螳・
  const randomStep = Math.floor(Math.random() * 3) + 1;

  const nextIndex = Math.min(currentIndex + randomStep, stages.length - 1);
  return stages[nextIndex];
};
