export const getZoneByPower = (pw) => {
  if (pw >= 2000) return "神化ゾーン";
  if (pw >= 1500) return "趁E��ゾーン";
  if (pw >= 1001) return "爁E��ゾーン";
  return "ノ�Eマル";
};
