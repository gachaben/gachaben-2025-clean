// 攻撃/守備の段階 → 倍率/軽減 変換
// 例：段階0〜5。攻撃は +0.2/段（最大2.0倍）、守備は -0.1/段（最大半減）
// すでに cptLevel / bptLevel を別ロジックで算出しているなら、その値を渡せばOK。

export function getAtkMultiplier(cptLevel = 0) {
  const clamped = Math.max(0, Math.min(5, Number(cptLevel) || 0));
  return 1 + clamped * 0.2; // 1.0〜2.0
}

export function getDefReduction(bptLevel = 0) {
  const blamped = Math.max(0, Math.min(5, Number(bptLevel) || 0));
  return blamped * 0.1; // 0.0〜0.5
}

// 実ダメ計算（四捨五入）
export function calcDamage(betPw, atkLevel, defLevel) {
  const atk = getAtkMultiplier(atkLevel);
  const red = getDefReduction(defLevel); // 0〜0.5
  const raw = Number(betPw) * atk * (1 - red);
  return Math.max(0, Math.round(raw));
}
