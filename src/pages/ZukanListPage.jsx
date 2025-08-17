// src/pages/ZukanListPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";
import { itemNames } from "../data/itemNames";

// id から rank / seriesId / stage を推定（命名規則: 2508_A_005_kabuto_stage1）
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
  const [ownedIds, setOwnedIds] = useState([]);       // users/{uid}.items の配列
  const [fsItems, setFsItems] = useState([]);         // Firestore items 全件
  const [selected, setSelected] = useState(null);

  // 1) ログインと Firestore 読み込み
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      setUserId(user.uid);

      // 所持ID
      const ud = await getDoc(doc(db, "users", user.uid));
      const arr = Array.isArray(ud.data()?.items) ? ud.data().items : [];
      setOwnedIds(arr);

      // items 全件（PW/BPT/CPT 等のステータス保持側）
      const snap = await getDocs(collection(db, "items"));
      setFsItems(snap.docs.map((d) => ({ ...d.data(), itemId: d.id })));
    });
    return () => unsub();
  }, []);

  // 2) 図鑑用の全レコードを作る（itemNames を起点に、所持/未所持と FS ステータスを合体）
  const catalog = useMemo(() => {
    return Object.keys(itemNames).map((id) => {
      const label = itemNames[id];
      const meta = parseId(id);
      // Firestore に同じ itemId があれば数値系を反映（なければ 0）
      const fs = fsItems.find((x) => x.itemId === id) || {};
      return {
        itemId: id,
        name: label,
        imageName: id,                 // 画像ファイル名＝id ベース（.png は ItemCard 側で付与）
        seriesId: meta.seriesId,
        stage: meta.stage,
        rank: meta.rank,
        pw: Number(fs.pw) || 0,
        cpt: Number(fs.cpt) || 0,
        bpt: Number(fs.bpt) || 0,
        owned: ownedIds.includes(id),  // ← ここでカラー/グレー切替に使う
      };
    });
  }, [ownedIds, fsItems]);

  // 3) PW注入（例）
  const handlePowerUp = async (amount) => {
    if (!selected) return;
    const ref = doc(db, "items", selected.itemId);
    const newPw = (Number(selected.pw) || 0) + Number(amount);
    await updateDoc(ref, { pw: newPw });
    // 画面更新
    setFsItems((prev) =>
      prev.map((x) => (x.itemId === selected.itemId ? { ...x, pw: newPw } : x))
    );
    setSelected(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">図鑑</h1>

      {/* 一覧（ItemCard をそのまま使う） */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {catalog.map((it) => (
          <div key={it.itemId} onClick={() => setSelected(it)} className="cursor-pointer">
            <ItemCard
              item={it}
              owned={it.owned}   // ← これでカラー／グレー自動切替
              pwMode={false}
            />
          </div>
        ))}
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center relative shadow-xl">
            <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelected(null)}>✕</button>

            <h2 className="text-lg font-bold mb-2">{selected.name}</h2>

            {/* 大きめプレビューにも ItemCard を再利用してもいいし、画像だけ見せてもOK */}
            <div className="mx-auto scale-110 origin-center">
              <ItemCard item={selected} owned={selected.owned} pwMode={false} />
            </div>

            <div className="mt-3 text-sm">
              <div>PW: {selected.pw}</div>
              <div>CPT: {selected.cpt} / BPT: {selected.bpt}</div>
            </div>

            <div className="mt-3 flex gap-2 justify-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handlePowerUp(100)}>+100 注ぐ</button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      onClick={() => {/* バトルへ遷移など */}}>バトルする</button>
              <button className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                      onClick={() => setSelected(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
