// src/pages/BattlePage.jsx
import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
export default function BattlePage() {
console.log("🔵 LIVE BattlePage.jsx", import.meta.url);
  const nav = useNavigate();
  const loc = useLocation();

  // Zukan/選択ページから受け取り
  const selectedItem = loc.state?.selectedItem || null; // 自分
  const items = loc.state?.items || [];
  const enemyItem = loc.state?.enemyItem ?? (
  items.find(x => (x.id||x.itemId)!==(selectedItem?.id||selectedItem?.itemId)) || null
);
  const round        = loc.state?.round        ?? 1;
  const totalRounds  = loc.state?.totalRounds  ?? 3;

  // 残PW（あなたの既存state/propsに合わせて必要なら差し替えOK）
  const myPwLeft    = loc.state?.myPwLeft    ?? 300;
  const enemyPwLeft = loc.state?.enemyPwLeft ?? 300;

  // 直URL侵入ガード
  useEffect(() => {
    if (!selectedItem) nav("/battle/item-select", { replace: true });
  }, [selectedItem, nav]);
  if (!selectedItem) return null;

  // 中央ゲージ表示用の割合（あなたのロジックで上書きOK）
  const { myPct, enemyPct } = useMemo(() => {
    const total = Math.max(1, myPwLeft + enemyPwLeft);
    return {
      myPct:    Math.round((myPwLeft    / total) * 100),
      enemyPct: Math.round((enemyPwLeft / total) * 100),
    };
  }, [myPwLeft, enemyPwLeft]);

// src/pages/BattlePage.jsx の return 内をこの形に
return (
  <div className="min-h-[calc(100vh-64px)] w-full mx-auto max-w-5xl px-4 py-6
                grid grid-rows-[auto_1fr_auto_1fr_auto] gap-4">
  <header className="row-start-1 text-center">…</header>

  {/* 上=相手 */}
  <section className="row-start-2 flex items-center justify-center">
    {enemyItem ? <ItemCard item={enemyItem} owned /> : <div className="text-gray-500">相手を準備中…</div>}
  </section>

  {/* 中央=ゲージ（あなたの紫バーDOMをここへ） */}
  <section className="row-start-3">…紫バーDOM…</section>

  {/* 下=自分 */}
  <section className="row-start-4 flex items-center justify-center">
    <ItemCard item={selectedItem} owned />
  </section>

  {/* 操作＆ログ */}
  <footer className="row-start-5">…PWボタン/ログ…</footer>
</div>

);

}


