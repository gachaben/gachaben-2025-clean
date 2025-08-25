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
      id: `${stage}${id}`,        
      name: `${baseNames[id]}（${stageNames[stage]}）`,
      stage: stage,
      seriesId: "kontyu"
    });
  });
});

export default kontyuItems;
