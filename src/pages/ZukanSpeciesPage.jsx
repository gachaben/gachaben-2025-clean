// src/pages/ZukanSpeciesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";
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
    // 2508 固定シリーズ（必要なら将来 param 化）
    const series = "2508";
    // 10体の番号は itemNames に依存するため、ここでは 1..10 を総当りせず「辞書から species のキーを検索」
    const keys = Object.keys(itemNames).filter(
      (k) => new RegExp(`^${series}_${rank}_.+_${species}_stage\\d+$`, "i").test(k)
    );

    // 万一辞書が stage1..4 しか無い前提ならこうでもOK:
    const stages = [1,2,3,4];
    const idAt = (st) => {
      const found = keys.find((k) => new RegExp(`_stage${st}$`, "i").test(k));
      return found || `${series}_${rank}_xxx_${species}_stage${st}`; // 無ければダミー（基本は存在する想定）
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
      <button onClick={() => nav(-1)} className="mb-2 underline">←戻る</button>
      <h1 className="text-xl font-bold mb-3">{rank}ランク / {species}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((it) => (
          <ItemCard key={it.itemId} item={it} owned={it.owned} pwMode={false} />
        ))}
      </div>

      <p className="mt-3 text-sm text-gray-600">
        ※ stage1〜3を揃えると、ガチャで stage4 を解放できます（実装フック可）
      </p>
    </div>
  );
}
