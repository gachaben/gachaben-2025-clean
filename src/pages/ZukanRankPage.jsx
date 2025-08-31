// src/pages/ZukanRankPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { itemNames } from "../data/itemNames";
import ItemCard from "../components/ItemCard";

const getSpeciesKey = (id) => {
  // 例: 2508_A_005_kabuto_stage1 → "kabuto"
  const m = String(id).replace(/\.png$/i, "").match(/^\d{4}_[SAB]_\d+_([a-z0-9]+)_stage\d+$/i);
  return m ? m[1] : id;
};

export default function ZukanRankPage() {
  const { rank } = useParams(); // 'S' | 'A' | 'B'
  const nav = useNavigate();
  const [ownedIds, setOwnedIds] = useState([]);
  const [fsItems, setFsItems] = useState([]);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      // 所持ID
      const ud = await getDoc(doc(db, "users", u.uid));
      setOwnedIds(Array.isArray(ud.data()?.items) ? ud.data().items : []);

      // items のステータス
      const snap = await getDocs(collection(db, "items"));
      setFsItems(snap.docs.map((d) => ({ ...d.data(), itemId: d.id })));
    });

    return () => unsub();
  }, []);

  // rank の 10体: stage1 キーを起点に species ごとに最高所持 stage を表示
  const list = useMemo(() => {
    // rank の stage1 キーだけ抽出
    const stage1Keys = Object.keys(itemNames).filter((k) =>
      new RegExp(`^\\d{4}_${rank}_\\d+_.*_stage1$`, "i").test(k)
    );

    return stage1Keys.map((k) => {
      const species = getSpeciesKey(k);
      // species の全 stage の ID（1..4）
      const ids = [1, 2, 3, 4].map((st) => k.replace(/_stage1$/i, `_stage${st}`));

      // 所持中で最大 stage を採用
      const ownedStages = ids
        .filter((id) => ownedIds.includes(id))
        .map((id) => Number(id.match(/stage(\d+)/i)?.[1] || 1));
      const stageToShow = ownedStages.length ? Math.max(...ownedStages) : 1;

      const idToShow = k.replace(/_stage1$/i, `_stage${stageToShow}`);
      const label = itemNames[idToShow] || itemNames[k];
      const seriesId = idToShow.slice(0, 4); // "2508"

      // Firestore のステータス (pw/cpt/bpt) を反映
      const fs = fsItems.find((x) => x.itemId === idToShow) || {};

      return {
        itemId: idToShow,
        name: label,
        imageName: idToShow,
        seriesId,
        stage: stageToShow,
        rank,
        pw: Number(fs.pw) || 0,
        cpt: Number(fs.cpt) || 0,
        bpt: Number(fs.bpt) || 0,
        owned: ownedIds.includes(idToShow),
        species,
      };
    });
  }, [rank, ownedIds, fsItems]);

  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="mb-2 underline">
        ← 戻る
      </button>

      <h1 className="text-xl font-bold mb-3">
        {rank}ランク の 10体（代表表示）
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {list.map((it) => (
          <div
            key={it.itemId}
            onClick={() => nav(`/zukan/${rank}/${it.species}`)}
            className="cursor-pointer"
          >
            <ItemCard item={it} owned={it.owned} pwMode={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
