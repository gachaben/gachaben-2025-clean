// ⬆️ ファイル：src/pages/ZukanInsectDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import ItemCard from "../components/ItemCard";
import PwUseModal from "../components/PwUseModal";
import GachaVideoModal from "../components/GachaVideoModal";

const ZukanInsectDetailPage = () => {
  const { seriesId, rank, name: encodedName } = useParams();
  const name = decodeURIComponent(encodedName);
  const [items, setItems] = useState([]);
  const [userItems, setUserItems] = useState({});
  const [userPw, setUserPw] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedPwAmount, setSelectedPwAmount] = useState(100);
  const [oshiId, setOshiId] = useState(null);
  const [showGachaModal, setShowGachaModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const owned = userData.items || {};
      setUserItems(owned);
      setUserPw(userData.pw || 0);
      setOshiId(userData.oshiCharacterId || null);

      const q = query(
        collection(db, "items"),
        where("seriesId", "==", seriesId),
        where("rank", "==", rank),
        where("name", "==", name)
      );

      const snap = await getDocs(q);
      const result = snap.docs.map(doc => ({
        ...doc.data(),
        itemId: doc.id,
        pw: owned[doc.id]?.pw || 0,
      }));

      const sorted = result.sort((a, b) => (a.stage || 0) - (b.stage || 0));
      setItems(sorted);
    };

    fetchData();
  }, [seriesId, rank, name]);

  const handleUsePw = async (amount) => {
    if (!selectedItem) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    const itemId = selectedItem.itemId;

    try {
      await updateDoc(userRef, {
        [`items.${itemId}.pw`]: increment(amount),
        pw: increment(-amount),
      });

      setUserItems((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          pw: (prev[itemId]?.pw || 0) + amount,
        },
      }));

      setUserPw((prev) => prev - amount);

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === itemId
            ? { ...item, pw: (item.pw || 0) + amount }
            : item
        )
      );

      setSelectedItem(null);
    } catch (e) {
      console.error("PW使用失敗", e);
      alert("PWの使用に失敗しました。");
    }
  };

  const handleGacha = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    const premiumItem = items.find(item => item.stage === 99);
    if (!premiumItem) return alert("プレミアアイテムが見つかりません");

    const alreadyOwned = !!userItems[premiumItem.itemId];
    if (alreadyOwned) return alert("すでにプレミアを持っています");

    const isWin = Math.random() < 0.5;

    if (isWin) {
      try {
        await updateDoc(userRef, {
          [`items.${premiumItem.itemId}`]: {
            pw: 0,
            acquiredAt: new Date()
          }
        });

        alert("🎉 当たり！プレミアゲット！");
        setUserItems(prev => ({
          ...prev,
          [premiumItem.itemId]: {
            pw: 0
          }
        }));
      } catch (e) {
        console.error("プレミア追加失敗", e);
        alert("プレミア付与に失敗しました。");
      }
    } else {
      alert("😥 はずれ…また動画を見てチャレンジしよう！");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{name}（{rank}ランク）の詳細</h2>
      <p className="mb-2 text-right text-gray-700 font-bold">
        あなたの所持PW：<span className="text-blue-600">{userPw}</span>
      </p>

      <div className="flex flex-wrap gap-4">
        {items.map((item) => {
          const owned = !!userItems[item.itemId];
          const canUsePw = item.type === "青虫";
          return (
            <div key={item.itemId} onClick={() => canUsePw && setSelectedItem(item)}>
              <ItemCard
                item={item}
                owned={owned}
                pwMode={canUsePw}
                onClick={() => canUsePw && setSelectedItem(item)}
              />
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <PwUseModal
          item={selectedItem}
          userPw={userPw}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleUsePw}
          onAmountChange={setSelectedPwAmount}
        />
      )}

      {/* 🔽 3体揃ってるかチェック & ガチャ演出 */}
      {(() => {
        const requiredStages = [1, 2, 3];
        const hasAll = requiredStages.every(stage =>
          items.some(item => item.stage === stage && userItems[item.itemId])
        );
        const hasPremium = items.some(item => item.stage === 99 && userItems[item.itemId]);

        if (rank === 'S' && hasAll && !hasPremium) {
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
                  <span className="font-bold text-yellow-700">「やったね！3体コンプリートだよ！」</span><br />
                  このチャンスを見逃すな！<br />
                  動画を見たら50%の確率でプレミアがもらえるかも…🏱
                </p>
                <button
                  className="px-6 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                  onClick={() => setShowGachaModal(true)}
                >
                  ▶️ 動画を見てガチャを引く
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* 🎥 ガチャ動画モーダル */}
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
