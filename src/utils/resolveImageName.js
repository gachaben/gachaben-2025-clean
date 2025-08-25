// src/utils/resolveImageName.js
import { itemNames } from "../data/itemNames.js";

// 陦ｨ遉ｺ蜷・竊・豁｣蠑丞錐縺ｮ繧ｨ繧､繝ｪ繧｢繧ｹ
const ALIASES = {
  "繧ｫ繝悶ヨ": "繧ｫ繝悶ヨ繝繧ｷ",
  "繝倥Λ繧ｯ繝ｬ繧ｹ": "繝倥Λ繧ｯ繝ｬ繧ｹ繧ｪ繧ｪ繧ｫ繝悶ヨ",
  "繝｢繝ｳ繧ｷ繝ｭ": "繝｢繝ｳ繧ｷ繝ｭ繝√Ι繧ｦ",
  "繧｢繧ｲ繝・: "繧｢繧ｲ繝上メ繝ｧ繧ｦ",
  "繧ｯ繝ｯ繧ｬ繧ｿ": "繧ｯ繝ｯ繧ｬ繧ｿ繝繧ｷ",
};

// 陦ｨ險倥ｆ繧後ｒ豁｣隕丞喧・域峡蠑ｧ繧・ｩｺ逋ｽ繧帝勁蜴ｻ・・
function normalizeLabel(s = "") {
  return String(s)
    .replace(/[・・].*?[)・云/g, "") // 諡ｬ蠑ｧ蜀・炎髯､
    .replace(/\s+/g, "")          // 遨ｺ逋ｽ蜑企勁
    .trim();
}

// itemNames 縺九ｉ縲後Λ繝吶Ν荳閾ｴ + rank/stage荳閾ｴ縲阪〒繧ｭ繝ｼ繧呈爾縺・
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
 * 逕ｻ蜒上・繝ｼ繧ｹ蜷搾ｼ域僑蠑ｵ蟄舌↑縺暦ｼ峨ｒ豎ｺ螳壹☆繧・
 * 蜆ｪ蜈磯・ｽ・
 *  1) itemNames 縺九ｉ name/rank/stage 縺ｧ遒ｺ螳夲ｼ医％繧後′豁｣隗｣・・
 *  2) legacy imageName 縺・蜈ｬ蠑上ヵ繧ｩ繝ｼ繝槭ャ繝医↑繧画治逕ｨ・井ｿ晞匱・・
 *  3) item.itemId/id 縺・蜈ｬ蠑上ヵ繧ｩ繝ｼ繝槭ャ繝医↑繧画治逕ｨ・井ｿ晞匱・・
 *  4) 隕九▽縺九ｉ縺ｪ縺代ｌ縺ｰ遨ｺ譁・ｭ・
 *
 * 蜈ｬ蠑上ヵ繧ｩ繝ｼ繝槭ャ繝・ 2508_S_005_kabuto_stage1
 */
export function resolveImageBaseName(item = {}) {
  const rank = String(item?.rank || item?.rarity || "").toUpperCase(); // "S" | "A" | "B"
  const stage = Number(item?.stage || 1);
  const name = String(item?.name || "");

  // 1) itemNames 繧呈怙蜆ｪ蜈・
  const fromMap = findKeyFromItemNames(name, rank, stage);
  if (fromMap) return fromMap;

  // 2) 譌ｧ imageName 縺悟・蠑上ヵ繧ｩ繝ｼ繝槭ャ繝医↑繧画治逕ｨ・・png 縺ｯ螟悶☆・・
  const legacy = String(item?.imageName || "").replace(/\.png$/i, "");
  const looksFormal =
    /^\d{4}_[SAB]_\d{3}_[a-z0-9]+_stage\d$/i.test(legacy) || /_stage\d$/i.test(legacy);
  if (legacy && looksFormal) return legacy;

  // 3) itemId / id 縺悟・蠑上ヵ繧ｩ繝ｼ繝槭ャ繝医↑繧画治逕ｨ
  const idLike = String(item?.itemId || item?.id || "").replace(/\.png$/i, "");
  if (/^\d{4}_[SAB]_\d{3}_[a-z0-9]+_stage\d$/i.test(idLike)) return idLike;

  // 4) 縺繧√↑繧臥ｩｺ
  return "";
}
