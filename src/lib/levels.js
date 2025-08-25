// 例：Cpt/Bptの素点→段隁E0、E に変換�E�しきい値は暫定！E
export function toLevelFromPoints(points = 0) {
  const p = Number(points) || 0;
  if (p >= 250) return 5;
  if (p >= 200) return 4;
  if (p >= 150) return 3;
  if (p >= 100) return 2;
  if (p >=  50) return 1;
  return 0;
}
const merged = baseItems.map(it => {
  const power = userItemPowersMap[it.itemId] || {};
  const cpt = power.cpt ?? 0;
  const bpt = power.bpt ?? 0;
  return {
    ...it,
    cpt, bpt,
    cptLevel: toLevelFromPoints(cpt),
    bptLevel: toLevelFromPoints(bpt),
  };
});
