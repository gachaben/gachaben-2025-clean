// src/pages/ZukanListPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/fbkit";
import ItemCard from "../components/ItemCard";
import { itemNames } from "../data/itemNames";

// id 縺九ｉ rank / seriesId / stage 繧呈耳螳夲ｼ亥多蜷崎ｦ丞援: 2508_A_005_kabuto_stage1・・
const parseId = (id) => {
  const m = String(id).match(/^(\d{4})_([SAB])_.*_stage(\d+)$/i);
  return {
    seriesId: m ? m[1] : "2508",
    rank: m ? m[2].toUpperCase() : "",
    stage: m ? Number(m[3]) : 1,
  };
};

export default function ZukanListPage() {
  const [userId, setUserId] = useState(null);
  const [ownedIds, setOwnedIds] = useState([]);       // users/{uid}.items 縺ｮ驟榊・
  const [fsItems, setFsItems] = useState([]);         // Firestore items 蜈ｨ莉ｶ
  const [selected, setSelected] = useState(null);

  // 1) 繝ｭ繧ｰ繧､繝ｳ縺ｨ Firestore 隱ｭ縺ｿ霎ｼ縺ｿ
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      setUserId(user.uid);

      // 謇謖！D
      const ud = await getDoc(doc(db, "users", user.uid));
      const arr = Array.isArray(ud.data()?.items) ? ud.data().items : [];
      setOwnedIds(arr);

      // items 蜈ｨ莉ｶ・・W/BPT/CPT 遲峨・繧ｹ繝・・繧ｿ繧ｹ菫晄戟蛛ｴ・・
      const snap = await getDocs(collection(db, "items"));
      setFsItems(snap.docs.map((d) => ({ ...d.data(), itemId: d.id })));
    });
    return () => unsub();
  }, []);

  // 2) 蝗ｳ髑醍畑縺ｮ蜈ｨ繝ｬ繧ｳ繝ｼ繝峨ｒ菴懊ｋ・・temNames 繧定ｵｷ轤ｹ縺ｫ縲∵園謖・譛ｪ謇謖√→ FS 繧ｹ繝・・繧ｿ繧ｹ繧貞粋菴難ｼ・
  const catalog = useMemo(() => {
    return Object.keys(itemNames).map((id) => {
      const label = itemNames[id];
      const meta = parseId(id);
      // Firestore 縺ｫ蜷後§ itemId 縺後≠繧後・謨ｰ蛟､邉ｻ繧貞渚譏・医↑縺代ｌ縺ｰ 0・・
      const fs = fsItems.find((x) => x.itemId === id) || {};
      return {
        itemId: id,
        name: label,
        imageName: id,                 // 逕ｻ蜒上ヵ繧｡繧､繝ｫ蜷搾ｼ拱d 繝吶・繧ｹ・・png 縺ｯ ItemCard 蛛ｴ縺ｧ莉倅ｸ趣ｼ・
        seriesId: meta.seriesId,
        stage: meta.stage,
        rank: meta.rank,
        pw: Number(fs.pw) || 0,
        cpt: Number(fs.cpt) || 0,
        bpt: Number(fs.bpt) || 0,
        owned: ownedIds.includes(id),  // 竊・縺薙％縺ｧ繧ｫ繝ｩ繝ｼ/繧ｰ繝ｬ繝ｼ蛻・崛縺ｫ菴ｿ縺・
      };
    });
  }, [ownedIds, fsItems]);

  // 3) PW豕ｨ蜈･・井ｾ具ｼ・
  const handlePowerUp = async (amount) => {
    if (!selected) return;
    const ref = doc(db, "items", selected.itemId);
    const newPw = (Number(selected.pw) || 0) + Number(amount);
    await updateDoc(ref, { pw: newPw });
    // 逕ｻ髱｢譖ｴ譁ｰ
    setFsItems((prev) =>
      prev.map((x) => (x.itemId === selected.itemId ? { ...x, pw: newPw } : x))
    );
    setSelected(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">蝗ｳ髑・/h1>

      {/* 荳隕ｧ・・temCard 繧偵◎縺ｮ縺ｾ縺ｾ菴ｿ縺・ｼ・*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {catalog.map((it) => (
          <div key={it.itemId} onClick={() => setSelected(it)} className="cursor-pointer">
            <ItemCard
              item={it}
              owned={it.owned}   // 竊・縺薙ｌ縺ｧ繧ｫ繝ｩ繝ｼ・上げ繝ｬ繝ｼ閾ｪ蜍募・譖ｿ
              pwMode={false}
            />
          </div>
        ))}
      </div>

      {/* 隧ｳ邏ｰ繝｢繝ｼ繝繝ｫ */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center relative shadow-xl">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelected(null)}>笨・/button>

            <h2 className="text-lg font-bold mb-2">{selected.name}</h2>

            {/* 螟ｧ縺阪ａ繝励Ξ繝薙Η繝ｼ縺ｫ繧・ItemCard 繧貞・蛻ｩ逕ｨ縺励※繧ゅ＞縺・＠縲∫判蜒上□縺題ｦ九○縺ｦ繧０K */}
            <div className="mx-auto scale-110 origin-center">
              <ItemCard item={selected} owned={selected.owned} pwMode={false} />
            </div>

            <div className="mt-3 text-sm">
              <div>PW: {selected.pw}</div>
              <div>CPT: {selected.cpt} / BPT: {selected.bpt}</div>
            </div>

            <div className="mt-3 flex gap-2 justify-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handlePowerUp(100)}>+100 豕ｨ縺・/button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      onClick={() => {/* 繝舌ヨ繝ｫ縺ｸ驕ｷ遘ｻ縺ｪ縺ｩ */}}>繝舌ヨ繝ｫ縺吶ｋ</button>
              <button className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => setSelected(null)}>髢峨§繧・/button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
