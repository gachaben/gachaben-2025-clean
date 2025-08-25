const kontyuItems = [];

// 名前のテンプレ（仮）

const stages = ["youchuu", "sanagi", "seichuu", "premium"];
const stageNames = {

  youchuu: "ようちゅう",
  sanagi: "さなぎ",
  seichuu: "せいちゅう",
  premium: "プレミアム"
};

Object.keys(baseNames).forEach((id) => {
  stages.forEach((stage) => {
    kontyuItems.push({
      id: `${stage}${id}`,        // 例: egg001
      name: `${baseNames[id]}（${stageNames[stage]}）`,
      stage: stage,
      seriesId: "kontyu"
    });
  });
});

export default kontyuItems;
