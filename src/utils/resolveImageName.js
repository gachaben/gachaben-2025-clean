// src/utils/resolveImageName.js
import { itemNames } from "../data/itemNames.js";

// 表示名 → 正式名のエイリアス
const ALIASES = {
  "カブト": "カブトムシ",
  "ヘラクレス": "ヘラクレスオオカブト",
  "モンシロ": "モンシロチョウ",
  "アゲハ": "アゲハチョウ",
  "クワガタ": "クワガタムシ",
};

// 表記ゆれを正規化（括弧や空白を除去）
function normalizeLabel(s = "") {
  return String(s)
    .replace(/[（(].*?[)）]/g, "") // 括弧内削除
    .replace(/\s+/g, "")          // 空白削除
    .trim();
}

// itemNames から「ラベル一致 + rank/stage一致」でキーを探す
function findKeyFromItemNames(name, rank, stage) {
  const canonical = ALIASES[normalizeLabel(name)] || normalizeLabel(name);
  const rankNeedle = `_${String(rank).toUpperCase()}_`;
  const stageSuffix = `_stage${Number(stage || 1)}`;

  for (const [key, label] of Object.entries(itemNames)) {
    const normLabel = normalizeLabel(label);
    if (normLabel === canonical && key.includes(rankNeedle) && key.endsWith(stageSuffix)) {
      return key; // ex) 2508_S_005_kabuto_stage1
    }
  }
  return "";
}

/**
 * 画像ベース名（拡張子なし）を決定する
 * 優先順位:
 *  1) itemNames から name/rank/stage で確定（これが正解）
 *  2) legacy imageName が 公式フォーマットなら採用（保険）
 *  3) item.itemId/id が 公式フォーマットなら採用（保険）
 *  4) 見つからなければ空文字
 *
 * 公式フォーマット: 2508_S_005_kabuto_stage1
 */
export function resolveImageBaseName(item = {}) {
  const rank = String(item?.rank || item?.rarity || "").toUpperCase(); // "S" | "A" | "B"
  const stage = Number(item?.stage || 1);
  const name = String(item?.name || "");

  // 1) itemNames を最優先
  const fromMap = findKeyFromItemNames(name, rank, stage);
  if (fromMap) return fromMap;

  // 2) 旧 imageName が公式フォーマットなら採用（.png は外す）
  const legacy = String(item?.imageName || "").replace(/\.png$/i, "");
  const looksFormal =
    /^\d{4}_[SAB]_\d{3}_[a-z0-9]+_stage\d$/i.test(legacy) || /_stage\d$/i.test(legacy);
  if (legacy && looksFormal) return legacy;

  // 3) itemId / id が公式フォーマットなら採用
  const idLike = String(item?.itemId || item?.id || "").replace(/\.png$/i, "");
  if (/^\d{4}_[SAB]_\d{3}_[a-z0-9]+_stage\d$/i.test(idLike)) return idLike;

  // 4) だめなら空
  return "";
}
