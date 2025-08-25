// src/pages/Battle.jsx 縺ｪ縺ｩ・医％縺ｮ逕ｻ髱｢繧貞・縺励※縺・ｋ繝輔ぃ繧､繝ｫ・・
import React from "react";
import ItemCard from "../components/ItemCard"; // 竊・繝代せ縺ｯ迺ｰ蠅・↓蜷医ｏ縺帙※

export default function Battle() {
  // 繝・せ繝育畑縺ｮ繝繝溘・ item 繝・・繧ｿ
  const testItem = {
    rank: "S",
    seriesId: "kontyu",
    stage: 1,
    imageName: "2508_A_005_kabuto_stage1.png",
    bpt: 3,
    cpt: 2,
    pwValue: 200,
  };

  return (
    <div className="min-h-screen p-4">
      {/* ==== 縺薙％縺御ｸ譎ゅユ繧ｹ繝域棧・磯ｻ定レ譎ｯ・・=== */}
      <div
        style={{
          padding: 20,
          background: "black",
          borderRadius: 12,
          marginBottom: 24,
          display: "inline-block",
        }}
      >
        <ItemCard item={testItem} size="sm" withFx />
      </div>

      {/* ==== 縺薙％縺九ｉ荳九・蜈・・ UI・域里蟄倥・繧ｳ繝ｼ繝峨ｒ縺薙・荳九↓鄂ｮ縺擾ｼ・=== */}
      {/* 萓具ｼ壽里蟄倥・繝・ム繧・き繝ｼ繝我ｸ隕ｧ縺ｪ縺ｩ */}
      {/* <Header ... /> */}
      {/* <YourOriginalContent ... /> */}
    </div>
  );
}













// src/pages/BattlePage.jsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
export default function BattlePage() {
console.log("鳩 LIVE BattlePage.jsx", import.meta.url);
  const nav = useNavigate();
  const loc = useLocation();

  // Zukan/驕ｸ謚槭・繝ｼ繧ｸ縺九ｉ蜿励￠蜿悶ｊ
  const selectedItem = loc.state?.selectedItem || null; // 閾ｪ蛻・
  const items = loc.state?.items || [];
  const enemyItem = loc.state?.enemyItem ?? (
  items.find(x => (x.id||x.itemId)!==(selectedItem?.id||selectedItem?.itemId)) || null
);
  const round        = loc.state?.round        ?? 1;
  const totalRounds  = loc.state?.totalRounds  ?? 3;

  // 谿輝W・医≠縺ｪ縺溘・譌｢蟄・tate/props縺ｫ蜷医ｏ縺帙※蠢・ｦ√↑繧牙ｷｮ縺玲崛縺・K・・
  const myPwLeft    = loc.state?.myPwLeft    ?? 300;
  const enemyPwLeft = loc.state?.enemyPwLeft ?? 300;

  // 逶ｴURL萓ｵ蜈･繧ｬ繝ｼ繝・
  useEffect(() => {
    if (!selectedItem) nav("/battle/item-select", { replace: true });
  }, [selectedItem, nav]);
  if (!selectedItem) return null;

  // 荳ｭ螟ｮ繧ｲ繝ｼ繧ｸ陦ｨ遉ｺ逕ｨ縺ｮ蜑ｲ蜷茨ｼ医≠縺ｪ縺溘・繝ｭ繧ｸ繝・け縺ｧ荳頑嶌縺弘K・・
  const { myPct, enemyPct } = useMemo(() => {
    const total = Math.max(1, myPwLeft + enemyPwLeft);
    return {
      myPct:    Math.round((myPwLeft    / total) * 100),
      enemyPct: Math.round((enemyPwLeft / total) * 100),
    };
  }, [myPwLeft, enemyPwLeft]);

// src/pages/BattlePage.jsx 縺ｮ return 蜀・ｒ縺薙・蠖｢縺ｫ
return (
  <div className="min-h-[calc(100vh-64px)] w-full mx-auto max-w-5xl px-4 py-6
                grid grid-rows-[auto_1fr_auto_1fr_auto] gap-4">
  <header className="row-start-1 text-center">窶ｦ</header>

  {/* 荳・逶ｸ謇・*/}
  <section className="row-start-2 flex items-center justify-center">
    {enemyItem ? <ItemCard item={enemyItem} owned /> : <div className="text-gray-500">逶ｸ謇九ｒ貅門ｙ荳ｭ窶ｦ</div>}
  </section>

  {/* 荳ｭ螟ｮ=繧ｲ繝ｼ繧ｸ・医≠縺ｪ縺溘・邏ｫ繝舌・DOM繧偵％縺薙∈・・*/}
  <section className="row-start-3">窶ｦ邏ｫ繝舌・DOM窶ｦ</section>

  {/* 荳・閾ｪ蛻・*/}
  <section className="row-start-4 flex items-center justify-center">
    <ItemCard item={selectedItem} owned />
  </section>

  {/* 謫堺ｽ懶ｼ・Ο繧ｰ */}
  <footer className="row-start-5">窶ｦPW繝懊ち繝ｳ/繝ｭ繧ｰ窶ｦ</footer>
</div>

);

}


