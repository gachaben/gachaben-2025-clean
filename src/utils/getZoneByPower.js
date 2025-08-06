export const getZoneByPower = (pw) => {
  if (pw >= 2000) return "神化ゾーン";
  if (pw >= 1500) return "超越ゾーン";
  if (pw >= 1001) return "爆裂ゾーン";
  return "ノーマル";
};
