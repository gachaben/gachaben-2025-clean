// src/pages/ZukanRankPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";
import { itemNames } from "../data/itemNames";
import ItemCard from "../components/ItemCard";

const getSpeciesKey = (id) => {
  // 2508_A_005_kabuto_stage1 → kabuto
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

  // rank の 10体（stage1キー）を起点に species ごとに最高所持stageを決める
  const list = useMemo(() => {
    // rank の stage1キーだけ抽出（=10体）
    const stage1Keys = Object.keys(itemNames).filter(
      (k) => new RegExp(`^\\d{4}_${rank}_\\d+_.*_stage1$`, "i").test(k)
    );

    return stage1Keys.map((k) => {
      const species = getSpeciesKey(k);
      // その species の全 stage のID（1..4）
      const ids = [1,2,3,4].map((st) => k.replace(/_stage1$/i, `_stage${st}`));

      // 所持している中で最大 stage を探す
      const ownedStages = ids
        .filter((id) => ownedIds.includes(id))
        .map((id) => Number(id.match(/stage(\d+)/i)?.[1] || 1));
      const stageToShow = ownedStages.length ? Math.max(...ownedStages) : 1;

      const idToShow = k.replace(/_stage1$/i, `_stage${stageToShow}`);
      const label = itemNames[idToShow] || itemNames[k]; // 名前は辞書から
      const seriesId = idToShow.slice(0,4); // "2508"

      // Firestore のステータス（pw/cpt/bpt）があれば反映
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
      <button onClick={() => nav(-1)} className="mb-2 underline">←戻る</button>
      <h1 className="text-xl font-bold mb-3">{rank}ランク（全10体）</h1>

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
