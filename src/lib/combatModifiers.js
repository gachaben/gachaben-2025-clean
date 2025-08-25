// 謾ｻ謦・螳亥ｙ縺ｮ谿ｵ髫・竊・蛟咲紫/霆ｽ貂・螟画鋤
// 萓具ｼ壽ｮｵ髫・縲・縲よ判謦・・ +0.2/谿ｵ・域怙螟ｧ2.0蛟搾ｼ峨∝ｮ亥ｙ縺ｯ -0.1/谿ｵ・域怙螟ｧ蜊頑ｸ幢ｼ・
// 縺吶〒縺ｫ cptLevel / bptLevel 繧貞挨繝ｭ繧ｸ繝・け縺ｧ邂怜・縺励※縺・ｋ縺ｪ繧峨√◎縺ｮ蛟､繧呈ｸ｡縺帙・OK縲・

export function getAtkMultiplier(cptLevel = 0) {
  const clamped = Math.max(0, Math.min(5, Number(cptLevel) || 0));
  return 1 + clamped * 0.2; // 1.0縲・.0
}

export function getDefReduction(bptLevel = 0) {
  const blamped = Math.max(0, Math.min(5, Number(bptLevel) || 0));
  return blamped * 0.1; // 0.0縲・.5
}

// 螳溘ム繝｡險育ｮ暦ｼ亥屁謐ｨ莠泌・・・
export function calcDamage(betPw, atkLevel, defLevel) {
  const atk = getAtkMultiplier(atkLevel);
  const red = getDefReduction(defLevel); // 0縲・.5
  const raw = Number(betPw) * atk * (1 - red);
  return Math.max(0, Math.round(raw));
}
