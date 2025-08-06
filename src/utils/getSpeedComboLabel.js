// src/utils/getSpeedComboLabel.js

const getSpeedComboLabel = (combo) => {
  if (combo >= 19) return "神速ギガストーム！！！👑⚡🔥";
  if (combo >= 17) return "アルティメットブレイク！！！💥";
  if (combo >= 15) return "超ギガクラッシュ！！！⚡🔥";
  if (combo >= 13) return "ギガスピン！！！💫";
  if (combo >= 11) return "マッハインパクト！！✨";
  if (combo >= 9) return "音速ブレイク！！💥";
  if (combo >= 7) return "高速ドライブ！！⚡️";
  if (combo >= 5) return "ターボブースト！！🔥";
  if (combo >= 3) return "フルスロットル！！🚀";
  if (combo >= 1) return "ギアチェンジ！⚙️";
  return "";
};

export default getSpeedComboLabel;
