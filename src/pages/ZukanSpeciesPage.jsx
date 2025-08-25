// src/pages/ZukanSpeciesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/fbkit";
import { itemNames } from "../data/itemNames";
import ItemCard from "../components/ItemCard";

export default function ZukanSpeciesPage() {
  const { rank, species } = useParams(); // rank='S'|'A'|'B', species='kabuto'
  const nav = useNavigate();
  const [ownedIds, setOwnedIds] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (u) => {
      if (!u) return;
      const ud = await getDoc(doc(db, "users", u.uid));
      setOwnedIds(Array.isArray(ud.data()?.items) ? ud.data().items : []);
    });
    return () => unsub();
  }, []);

  const cards = useMemo(() => {
    // 2508 蝗ｺ螳壹す繝ｪ繝ｼ繧ｺ・亥ｿ・ｦ√↑繧牙ｰ・擂 param 蛹厄ｼ・
    const series = "2508";
    // 10菴薙・逡ｪ蜿ｷ縺ｯ itemNames 縺ｫ萓晏ｭ倥☆繧九◆繧√√％縺薙〒縺ｯ 1..10 繧堤ｷ丞ｽ薙ｊ縺帙★縲瑚ｾ樊嶌縺九ｉ species 縺ｮ繧ｭ繝ｼ繧呈､懃ｴ｢縲・
    const keys = Object.keys(itemNames).filter(
      (k) => new RegExp(`^${series}_${rank}_.+_${species}_stage\\d+$`, "i").test(k)
    );

    // 荳・ｸ霎樊嶌縺・stage1..4 縺励°辟｡縺・燕謠舌↑繧峨％縺・〒繧０K:
    const stages = [1,2,3,4];
    const idAt = (st) => {
      const found = keys.find((k) => new RegExp(`_stage${st}$`, "i").test(k));
      return found || `${series}_${rank}_xxx_${species}_stage${st}`; // 辟｡縺代ｌ縺ｰ繝繝溘・・亥渕譛ｬ縺ｯ蟄伜惠縺吶ｋ諠ｳ螳夲ｼ・
    };

    return stages.map((st) => {
      const id = idAt(st);
      const label = itemNames[id] || species;
      return {
        itemId: id,
        name: label,
        imageName: id,
        seriesId: series,
        stage: st,
        rank,
        pw: 0, cpt: 0, bpt: 0,
        owned: ownedIds.includes(id),
      };
    });
  }, [rank, species, ownedIds]);

  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="mb-2 underline">竊先綾繧・/button>
      <h1 className="text-xl font-bold mb-3">{rank}繝ｩ繝ｳ繧ｯ / {species}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((it) => (
          <ItemCard key={it.itemId} item={it} owned={it.owned} pwMode={false} />
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        窶ｻ stage1縲・繧呈純縺医ｋ縺ｨ縲√ぎ繝√Ε縺ｧ stage4 繧定ｧ｣謾ｾ縺ｧ縺阪∪縺呻ｼ亥ｮ溯｣・ヵ繝・け蜿ｯ・・
      </p>
    </div>
  );
}
