const kontyuItems = [];

// 蜷榊燕縺ｮ繝・Φ繝励Ξ・井ｻｮ・・

const stages = ["youchuu", "sanagi", "seichuu", "premium"];
const stageNames = {

  youchuu: "繧医≧縺｡繧・≧",
  sanagi: "縺輔↑縺・,
  seichuu: "縺帙＞縺｡繧・≧",
  premium: "繝励Ξ繝溘い繝"
};

Object.keys(baseNames).forEach((id) => {
  stages.forEach((stage) => {
    kontyuItems.push({
      id: `${stage}${id}`,        
      name: `${baseNames[id]}・・{stageNames[stage]}・荏,
      stage: stage,
      seriesId: "kontyu"
    });
  });
});

export default kontyuItems;
