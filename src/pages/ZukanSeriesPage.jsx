// ------------------------------------------------------
// 📘 ZukanSeriesPage.jsx（v4.0 プレミアム固定セクション対応）
// ------------------------------------------------------
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import ItemCard from "../components/ItemCard";
import { resolveImageBaseName } from "../utils/resolveImageName";

export default function ZukanSeriesPage() {
  const { seriesId = "kontyu", rank = "S" } = useParams();

  const auth = getFirebaseAuth();
  const db = getFirestoreDb();

  const [authReady, setAuthReady] = useState(false);
  const [userItems, setUserItems] = useState([]);
  const [premiumItems, setPremiumItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});
  const [loading, setLoading] = useState(true);

  // 未ログインなら匿名ログイン
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await signInAnonymously(auth);
      } else {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, [auth]);

  // 取得
  const fetchAll = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 通常アイテム
      const itemSnap = await getDoc(doc(db, "userItems", user.uid));
      const rawItems = itemSnap.exists() ? itemSnap.data() : {};

      // プレミアムアイテム（別コレクション）
      const premiumSnap = await getDoc(doc(db, "userPremiumItems", user.uid));
      const rawPremium = premiumSnap.exists() ? premiumSnap.data() : {};

      // パワーデータ
      const powersSnap = await getDocs(
        collection(db, "userItemPowers", user.uid, "items")
      );
      const powers = {};
      powersSnap.forEach((d) => (powers[d.id] = d.data()));
      setUserItemPowers(powers);

      // マージ
      const itemList = Object.entries(rawItems).map(([id, data]) => ({
        itemId: id,
        ...data,
        ...powers[id],
      }));

      const premiumList = Object.entries(rawPremium).map(([id, data]) => ({
        itemId: id,
        ...data,
      }));

      setUserItems(itemList);
      setPremiumItems(premiumList);
    } catch (e) {
      console.error("load error:", e);
      setUserItems([]);
      setPremiumItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) fetchAll();
  }, [authReady]);

  // フィルタ
  const filteredItems = useMemo(
    () =>
      userItems.filter(
        (it) =>
          String(it.seriesId || "").toLowerCase() ===
            String(seriesId).toLowerCase() &&
          String(it.rank || "").toUpperCase() === String(rank).toUpperCase()
      ),
    [userItems, seriesId, rank]
  );

  if (!authReady || loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-3">
          {seriesId} シリーズ・{rank} ランク
        </h1>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {seriesId} シリーズ・{rank} ランク図鑑
      </h1>

      {/* 🟡 プレミアム固定セクション */}
      {premiumItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-3">
            👑 プレミアムコレクション
          </h2>
          <div className="flex flex-wrap gap-3 justify-start">
            {premiumItems.map((item) => (
              <ItemCard key={item.itemId} item={item} owned={true} />
            ))}
          </div>
          <hr className="mt-4 border-yellow-400/50" />
        </div>
      )}

      {/* 🔹 通常アイテム（S/A/B） */}
      {filteredItems.length === 0 ? (
        <p className="text-gray-500">このランクのアイテムはまだありません。</p>
      ) : (
        <div className="flex flex-wrap gap-3 justify-start">
          {filteredItems.map((item) => (
            <ItemCard key={item.itemId} item={item} owned={true} />
          ))}
        </div>
      )}
    </div>
  );
}
