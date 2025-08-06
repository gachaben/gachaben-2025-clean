// src/utils/getRandomStageUp.js

// ランダムに進化ステージを決定する関数
export const getRandomStageUp = (currentStage) => {
  const stages = ["stage1", "stage2", "stage3", "stage4"];

  const currentIndex = stages.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= stages.length - 1) {
    return currentStage; // 進化できない場合はそのまま
  }

  // 1〜3段階進化をランダムに決定
  const randomStep = Math.floor(Math.random() * 3) + 1;

  const nextIndex = Math.min(currentIndex + randomStep, stages.length - 1);
  return stages[nextIndex];
};
