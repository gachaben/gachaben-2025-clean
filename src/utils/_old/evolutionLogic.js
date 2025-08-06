// 進化段階と獲得パワーを決定する関数
export const decideEvolution = (adType) => {
  const rand = Math.random();
  let stageUp = 1;
  let pw = 100;

  if (adType === "none") {
    stageUp = 1;
    pw = 100;
  } else if (adType === "short") {
    // 5秒広告
    if (rand < 0.2) {
      stageUp = 2;
      pw = 200;
    } else {
      stageUp = 1;
      pw = 100;
    }
  } else if (adType === "medium") {
    // 10秒広告
    if (rand < 0.4) {
      stageUp = 2;
      pw = 200;
    } else {
      stageUp = 1;
      pw = 100;
    }
  } else if (adType === "long") {
    // 60秒広告
    if (rand < 0.1) {
      stageUp = 3;
      pw = 300;
    } else if (rand < 0.7) {
      stageUp = 2;
      pw = 200;
    } else {
      stageUp = 1;
      pw = 100;
    }
  }

  return { stageUp, pw };
};
