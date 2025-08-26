// src/lib/battleUtils.js
export function weightedPick(weights) {
  // weights: [{value:any, w:number}, ...]
  const total = weights.reduce((s, x) => s + x.w, 0);
  let r = Math.random() * total;
  for (const x of weights) {
    if ((r -= x.w) <= 0) return x.value;
  }
  return weights[weights.length - 1]?.value;
}

export function pickGachaMode() {
  // 80/50/30 を 1/1/1 でランダム（必要なら出現比率調整）
  return [80, 50, 30][Math.floor(Math.random() * 3)];
}

export function levelWeights(mode) {
  if (mode === 80) return [{ value: 3, w: 80 }, { value: 2, w: 15 }, { value: 1, w: 5 }];
  if (mode === 50) return [{ value: 3, w: 50 }, { value: 2, w: 35 }, { value: 1, w: 15 }];
  return [{ value: 3, w: 30 }, { value: 2, w: 40 }, { value: 1, w: 30 }];
}

export function jpDateKey(d = new Date()) {
  // JSTで日付キー（YYYY-MM-DD）
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const jst = new Date(utc + 9 * 3600000);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, "0");
  const day = String(jst.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
