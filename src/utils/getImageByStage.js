// utils/getImageByStage.js

export const getImageByStage = (stage, eggId) => {
  const eggNumber = eggId.replace("egg", "").padStart(3, "0");

  const nameMap = {
    egg001: "herakuresu",
    egg002: "ageha",
    egg003: "hati",
    egg004: "hotaru",
    egg005: "kabuto",
    egg006: "monsiro",
    egg007: "semi",
    egg008: "tentoumusi",
    egg009: "tombo",
    egg010: "kuwagata",
  };

  const name = nameMap[eggId] || "unknown";
  const filename = `${eggNumber}_${name}_egg.png`;

  switch (stage) {
    case "egg":
      return `/images/kontyu/stage1/${filename}`;
    case "youchuu":
      return `/images/kontyu/stage2/${filename}`;
    case "sanagi":
      return `/images/kontyu/stage3/${filename}`;
    case "seichuu":
      return `/images/kontyu/stage4/${filename}`;
    case "premium":
      return `/images/kontyu/stage5/${filename}`;
    default:
      return `/images/kontyu/stage1/${filename}`;
  }
};
