// src/pages/ZukanDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import ItemCard from "../components/ItemCard";

export default function ZukanDetailPage() {
  const { seriesId } = useParams(); // 例: "kontyu"
  const [allItems, setAllItems] = useState([]);
  const [userItemsMap, setUserItemsMap] = useState({});
  const [pwMode, setPwMode] = useState(false); // PWモード切替

  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  useEffect(() => {
    if (!seriesId) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserItemsMap({});
        return;
      }

      // 所持アイテム（users/{uid}.items はオブジェクト想定）
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};
      const ownedMap = userData?.items || {};
      setUserItemsMap(ownedMap);

      // 全アイテムを取得 → id を付与 → seriesId でフィルタ
      const snap = await getDocs(collection(db, "items"));
      const all = snap.docs.map((d) => ({ itemId: d.id, ...d.data() }));
      const filtered = all.filter((it) => String(it.seriesId) === String(seriesId));
      setAllItems(filtered);
    });

    return () => unsubscribe();
  }, [auth, db, seriesId]);

  if (!seriesId) {
    return <div style={{ padding: 16 }}>シリーズIDが指定されていません。</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-xl font-bold mb-4">{seriesId} シリーズのアイテム一覧</h2>

      {/* PWモード切替ボタン */}
      <button
        onClick={() => setPwMode((prev) => !prev)}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-1 mb-6"
      >
        {pwMode ? "PWモード解除" : "PWを使う"}
      </button>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {allItems.map((item) => {
          const owned = !!userItemsMap[item.itemId]; // オブジェクトのキー存在で判定
          return (
            <ItemCard
              key={item.itemId}
              item={item}
              owned={owned}
              highestZone={"神化"}
              pwMode={pwMode}
            />
          );
        })}
      </div>
    </div>
  );
}
