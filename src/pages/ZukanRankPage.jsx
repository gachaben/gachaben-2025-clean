// src/pages/ZukanRankPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "@/fbkit";
import { itemNames } from "../data/itemNames";
import ItemCard from "../components/ItemCard";

const getSpeciesKey = (id) => {
  // 2508_A_005_kabuto_stage1 竊・kabuto
  const m = id.replace(/\.png$/i, "").match(/^\d{4}_[SAB]_\d+_([a-z0-9]+)_stage\d+$/i);
  return m ? m[1] : id;
};

export default function ZukanRankPage() {
  const { rank } = useParams(); // 'S' | 'A' | 'B'
  const nav = useNavigate();
  const [ownedIds, setOwnedIds] = useState([]);
  const [fsItems, setFsItems] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (u) => {
      if (!u) return;
      const ud = await getDoc(doc(db, "users", u.uid));
      setOwnedIds(Array.isArray(ud.data()?.items) ? ud.data().items : []);
      const snap = await getDocs(collection(db, "items"));
      setFsItems(snap.docs.map((d) => ({ ...d.data(), itemId: d.id })));
    });
    return () => unsub();
  }, []);

  // rank 縺ｮ 10菴難ｼ・tage1繧ｭ繝ｼ・峨ｒ襍ｷ轤ｹ縺ｫ species 縺斐→縺ｫ譛鬮俶園謖《tage繧呈ｱｺ繧√ｋ
  const list = useMemo(() => {
    // rank 縺ｮ stage1繧ｭ繝ｼ縺縺第歓蜃ｺ・・10菴難ｼ・
    const stage1Keys = Object.keys(itemNames).filter(
      (k) => new RegExp(`^\\d{4}_${rank}_\\d+_.*_stage1$`, "i").test(k)
    );

    return stage1Keys.map((k) => {
      const species = getSpeciesKey(k);
      // 縺昴・ species 縺ｮ蜈ｨ stage 縺ｮID・・..4・・
      const ids = [1,2,3,4].map((st) => k.replace(/_stage1$/i, `_stage${st}`));

      // 謇謖√＠縺ｦ縺・ｋ荳ｭ縺ｧ譛螟ｧ stage 繧呈爾縺・
      const ownedStages = ids
        .filter((id) => ownedIds.includes(id))
        .map((id) => Number(id.match(/stage(\d+)/i)?.[1] || 1));
      const stageToShow = ownedStages.length ? Math.max(...ownedStages) : 1;

      const idToShow = k.replace(/_stage1$/i, `_stage${stageToShow}`);
      const label = itemNames[idToShow] || itemNames[k]; // 蜷榊燕縺ｯ霎樊嶌縺九ｉ
      const seriesId = idToShow.slice(0,4); // "2508"

      // Firestore 縺ｮ繧ｹ繝・・繧ｿ繧ｹ・・w/cpt/bpt・峨′縺ゅｌ縺ｰ蜿肴丐
      const fs = fsItems.find((x) => x.itemId === idToShow) || {};

      return {
        itemId: idToShow,
        name: label,
        imageName: idToShow,
        seriesId,
        stage: stageToShow,
        rank,
        pw: Number(fs.pw) || 0, cpt: Number(fs.cpt) || 0, bpt: Number(fs.bpt) || 0,
        owned: ownedIds.includes(idToShow),
        species,
      };
    });
  }, [rank, ownedIds, fsItems]);

  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="mb-2 underline">竊先綾繧・/button>
      <h1 className="text-xl font-bold mb-3">{rank}繝ｩ繝ｳ繧ｯ・亥・10菴難ｼ・/h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.map((it) => (
          <div key={it.itemId} onClick={() => nav(`/zukan/${rank}/${it.species}`)} className="cursor-pointer">
            <ItemCard item={it} owned={it.owned} pwMode={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
