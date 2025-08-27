// src/pages/ZukanInsectDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ItemCard from "../components/ItemCard";
import GachaVideoModal from "../components/GachaVideoModal";

const ZukanInsectDetailPage = () => {
  const { seriesId, rank, name: encodedName } = useParams();
  const name = decodeURIComponent(encodedName || "");
  const [items, setItems] = useState([]);
  const [userItems, setUserItems] = useState({});
  const [oshiId, setOshiId] = useState(null);
  const [showGachaModal, setShowGachaModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();

      // ユーザーデータ
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const owned = userData.items || {};
      setUserItems(owned);
      setOshiId(userData.oshiCharacterId || null);

      // アイテム（該当のシリーズ・ランク・名前）
      const q = query(
        collection(db, "items"),
        where("seriesId", "==", seriesId),
        where("rank", "==", rank),
        where("name", "==", name)
      );

      const snap = await getDocs(q);
      const result = snap.docs.map((d) => ({
        ...d.data(),
        itemId: d.id,
      }));

      const sorted = result.sort((a, b) => (a.stage || 0) - (b.stage || 0));
      setItems(sorted);
    };

    fetchData();
  }, [seriesId, rank, name]);

  const handleGacha = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    const premiumItem = items.find((item) => item.stage === 99);
    if (!premiumItem) {
      alert("プレミアアイテムが見つかりません。");
      return;
    }

    const alreadyOwned = !!userItems[premiumItem.itemId];
    if (alreadyOwned) {
      alert("すでにプレミアを所持しています。");
      return;
    }

    const isWin = Math.random() < 0.5;

    if (isWin) {
      try {
        await updateDoc(userRef, {
          [`items.${premiumItem.itemId}`]: {
            acquiredAt: new Date(),
          },
        });

        alert("🎉 当たり！プレミアゲット！");
        setUserItems((prev) => ({
          ...prev,
          [premiumItem.itemId]: {},
        }));
      } catch (e) {
        console.error("プレミア付与に失敗:", e);
        alert("プレミア付与に失敗しました。もう一度お試しください。");
      }
    } else {
      alert("😥 はずれ…また動画を見てチャレンジしてね！");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {name}（{rank}ランク）詳細
      </h2>

      <div className="flex flex-wrap gap-4">
        {items.map((item) => {
          const owned = !!userItems[item.itemId];
          return (
            <div key={item.itemId} className="cursor-pointer">
              <ItemCard item={item} owned={owned} />
            </div>
          );
        })}
      </div>

      {/* 3体揃いチェック & ガチャ導線 */}
      {(() => {
        const requiredStages = [1, 2, 3];
        const hasAll = requiredStages.every((stage) =>
          items.some((item) => item.stage === stage && userItems[item.itemId])
        );
        const hasPremium = items.some(
          (item) => item.stage === 99 && userItems[item.itemId]
        );

        if (rank === "S" && hasAll && !hasPremium) {
          return (
            <div className="mt-6 p-4 border rounded-lg shadow bg-yellow-50 flex items-center gap-4">
              {oshiId && (
                <img
                  src={`/images/oshi/oshi_${oshiId}.png`}
                  alt="ナビキャラ"
                  className="w-20 h-20 object-contain"
                />
              )}

              <div className="flex-1 text-left">
                <p className="text-sm text-gray-800 mb-2">
                  <span className="font-bold text-yellow-700">
                    「やった！3体コンプリートだよ！」
                  </span>
                  <br />
                  このチャンスを見送らないでね。<br />
                  動画を見たら50%の確率でプレミアがもらえるかも…🏆
                </p>
                <button
                  className="px-6 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                  onClick={() => setShowGachaModal(true)}
                >
                  ▶ 動画を見てガチャを引く
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* ガチャ動画モーダル */}
      {showGachaModal && (
        <GachaVideoModal
          onClose={() => setShowGachaModal(false)}
          onGacha={() => {
            setShowGachaModal(false);
            handleGacha();
          }}
        />
      )}
    </div>
  );
};

export default ZukanInsectDetailPage;
