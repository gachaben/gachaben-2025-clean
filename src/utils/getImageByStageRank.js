// 年月コードは固定で 2025年8月 = "2508"
export const getImageByStageRank = (itemId, stage, rank) => {
  const yearMonth = "2508";

  // itemId: 例 "S001_herakuresu"
  const parts = itemId.split("_");
  const number = parts[0].replace("S", ""); // "001"
  const name = parts[1]; // "herakuresu"

  const fileName = `${yearMonth}_${rank.toUpperCase()}_${number}_${name}_${stage}.png`;
  return `/images/kontyu/${stage}/${fileName}`;
};

