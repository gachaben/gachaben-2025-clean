const kontyuItems = [];

// 名前のテンプレ（仮）
const baseNames = {
  "001": "きらきらたまご",
  "002": "きらきらたまご",
  "003": "むしたまご3",
  "004": "むしたまご4",
  "005": "むしたまご5",
  "006": "むしたまご6",
  "007": "むしたまご7",
  "008": "むしたまご8",
  "009": "むしたまご9",
  "010": "むしたまご10"
};

const stages = ["egg", "youchuu", "sanagi", "seichuu", "premium"];
const stageNames = {
  egg: "たまご",
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
