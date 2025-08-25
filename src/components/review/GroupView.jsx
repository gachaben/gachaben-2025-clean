import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * props 萓・
 * - tokens: [{ id:"t1", text:"繧ｫ", }, { id:"t2", text:"繝・ }, ...]  // 荳ｦ縺ｹ縺ｦ遲斐∴繧剃ｽ懊ｋ邏譚・
 * - answer: ["繧ｫ","繝・,"繝・] 繧ゅ＠縺上・ [["繧ｫ","繝・,"繝・], ["逕ｲ","豁ｦ","蝨・]] 縺ｮ繧医≧縺ｪ隍・焚隗｣OK
 * - onCorrect(): void
 * - onWrong(): void
 * - questionId: string | number  // 雉ｪ蝠丞・譖ｿ讀懃衍逕ｨ・医Μ繧ｻ繝・ヨ縺ｫ菴ｿ縺・ｼ・
 */
export default function GroupView({
  tokens = [],
  answer = [],
  onCorrect,
  onWrong,
  questionId,
}) {
  // 驕ｸ謚樔ｿ晄戟縺ｯ縲栗D縺ｮ驟榊・縲阪〒邂｡逅・ｼ医が繝悶ず繧ｧ繧ｯ繝医＃縺ｨ蜈･繧後ｋ縺ｨ蜀阪Ξ繝ｳ繝繝ｼ縺ｧ蜿ら・縺後ぜ繝ｬ縺後■・・
  const [activeIds, setActiveIds] = useState([]); // ["t1","t3",...]
  const [submitting, setSubmitting] = useState(false); // 莠碁㍾謚ｼ縺鈴亟豁｢

  // 笨・雉ｪ蝠上′蛻・ｊ譖ｿ繧上▲縺溘ｉ驕ｸ謚槭Μ繧ｻ繝・ヨ
  useEffect(() => {
    setActiveIds([]);
    setSubmitting(false);
  }, [questionId]);

  // id -> token 縺ｮ O(1) 蜿ら・
  const tokenMap = useMemo(() => {
    const map = new Map();
    tokens.forEach((t) => map.set(String(t.id), t));
    return map;
  }, [tokens]);

  // 逕ｻ髱｢陦ｨ遉ｺ逕ｨ・壹檎ｵ・∩遶九※荳ｭ縲阪・驟榊・・・ext・・
  const activeTexts = useMemo(() => {
    return activeIds.map((id) => tokenMap.get(String(id))?.text ?? "");
  }, [activeIds, tokenMap]);

  // 笆ｼ 繧医￥縺ゅｋ繝舌げ・・
  // 1) setState 縺ｧ蜑榊屓縺ｮ state 繧定ｪｭ縺ｾ縺壹↓荳頑嶌縺・竊・蜿肴丐縺輔ｌ縺ｪ縺・豸医∴繧・
  // 2) index 繧・key/隴伜挨蟄舌↓菴ｿ縺・竊・驟榊・縺ｮ荳ｦ縺ｳ譖ｿ縺医〒繧ｺ繝ｬ繧・
  // 竍・縺ｪ縺ｮ縺ｧ縲掲unctional setState + 螳牙ｮ唔D縲阪〒螳溯｣・

  const toggleToken = (id) => {
    const safeId = String(id);
    setActiveIds((prev) => {
      // 譌｢縺ｫ驕ｸ謚・竊・隗｣髯､・磯・ｺ上・邯ｭ謖・ｼ・
      if (prev.includes(safeId)) {
        return prev.filter((x) => x !== safeId);
      }
      // 譛ｪ驕ｸ謚・竊・譛ｫ蟆ｾ縺ｫ霑ｽ蜉・磯・ｺ上′遲斐∴縺ｫ縺ｪ繧具ｼ・
      return [...prev, safeId];
    });
  };

  // 縲檎｢ｺ螳壹阪・繧ｿ繝ｳ縺ｮ豢ｻ諤ｧ/髱樊ｴｻ諤ｧ
  const canConfirm = activeIds.length > 0 && !submitting;

  // 遲斐∴縺ｮ豈斐∋譁ｹ・・
  // - answer 縺御ｸ谺｡蜈・ｼ・"繧ｫ","繝・,"繝・]・峨↑繧峨◎繧後→荳閾ｴ縺九ｒ隕九ｋ
  // - 螟夊ｧ｣蟇ｾ蠢懊〒莠梧ｬ｡蜈・ｼ・["繧ｫ","繝・,"繝・],["逕ｲ","豁ｦ","蝨・]])繧０K縺ｫ縺吶ｋ
  const isCorrect = () => {
    const now = activeTexts.join("");
    const normalize = (x) => (Array.isArray(x) ? x.join("") : String(x));
    if (Array.isArray(answer) && Array.isArray(answer[0])) {
      // 莠梧ｬ｡蜈・ｼ亥､夊ｧ｣・・
      return answer.some((arr) => normalize(arr) === now);
    }
    // 荳谺｡蜈・
    return normalize(answer) === now || normalize(answer) === activeTexts.join("");
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true); // 莠碁㍾髦ｲ豁｢

    try {
      if (isCorrect()) {
        onCorrect?.();
      } else {
        onWrong?.();
      }
    } finally {
      // 蛻､螳壹′邨ゅｏ縺｣縺溘ｉ谺｡蝠城｡後〒繝ｪ繧ｻ繝・ヨ縺輔ｌ繧句燕謠舌・
      // 蜷御ｸ蝠城｡後〒繧・ｊ逶ｴ縺励ｒ險ｱ縺励◆縺・ｴ蜷医・縺薙％縺ｧ activeIds=[] 縺ｫ縺吶ｋ縲・
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 邨・∩遶九※荳ｭ縺ｮ陦ｨ遉ｺ・医％縺薙′豸医∴繧具ｼ捏tate鬟帙・繧堤桝縺・ｴ謇・・*/}
      <div className="p-2 rounded-md border">
        <div className="text-sm opacity-70 mb-1">邨・∩遶九※荳ｭ</div>
        <div className="text-xl min-h-[2.5rem]">
          {activeTexts.length ? activeTexts.join("") : <span className="opacity-50">・域悴驕ｸ謚橸ｼ・/span>}
        </div>
      </div>

      {/* 繝医・繧ｯ繝ｳ荳隕ｧ */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((tok) => {
          const id = String(tok.id);
          const active = activeIds.includes(id);
          return (
            <button
              key={id} // 竊・index 繧堤ｵｶ蟇ｾ菴ｿ繧上↑縺・
              type="button"
              onClick={() => toggleToken(id)} // 竊・onClick 縺縺托ｼ・nMouseDown遲峨・荳崎ｦ・ｼ・
              className={`px-3 py-2 rounded-md border transition
                ${active ? "ring-2 ring-offset-1" : ""}`}
            >
              {tok.text}
            </button>
          );
        })}
      </div>

      {/* 遒ｺ螳壹・繧ｿ繝ｳ */}
      <div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={`px-4 py-2 rounded-md border
            ${canConfirm ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          遒ｺ螳・
        </button>
      </div>
    </div>
  );
}
