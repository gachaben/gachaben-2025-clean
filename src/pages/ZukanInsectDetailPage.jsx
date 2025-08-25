// 筮・ｸ・繝輔ぃ繧､繝ｫ・嘖rc/pages/ZukanInsectDetailPage.jsx
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
      console.error("PW菴ｿ逕ｨ螟ｱ謨・, e);
      alert("PW縺ｮ菴ｿ逕ｨ縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・);
    }
  };

  const handleGacha = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    const premiumItem = items.find(item => item.stage === 99);
    if (!premiumItem) return alert("繝励Ξ繝溘い繧｢繧､繝・Β縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ");

    const alreadyOwned = !!userItems[premiumItem.itemId];
    if (alreadyOwned) return alert("縺吶〒縺ｫ繝励Ξ繝溘い繧呈戟縺｣縺ｦ縺・∪縺・);

    const isWin = Math.random() < 0.5;

    if (isWin) {
      try {
        await updateDoc(userRef, {
          [`items.${premiumItem.itemId}`]: {
            pw: 0,
            acquiredAt: new Date()
          }
        });

        alert("脂 蠖薙◆繧奇ｼ√・繝ｬ繝溘い繧ｲ繝・ヨ・・);
        setUserItems(prev => ({
          ...prev,
          [premiumItem.itemId]: {
            pw: 0
          }
        }));
      } catch (e) {
        console.error("繝励Ξ繝溘い霑ｽ蜉螟ｱ謨・, e);
        alert("繝励Ξ繝溘い莉倅ｸ弱↓螟ｱ謨励＠縺ｾ縺励◆縲・);
      }
    } else {
      alert("丼 縺ｯ縺壹ｌ窶ｦ縺ｾ縺溷虚逕ｻ繧定ｦ九※繝√Ε繝ｬ繝ｳ繧ｸ縺励ｈ縺・ｼ・);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{name}・・rank}繝ｩ繝ｳ繧ｯ・峨・隧ｳ邏ｰ</h2>
      <p className="mb-2 text-right text-gray-700 font-bold">
        縺ゅ↑縺溘・謇謖￣W・・span className="text-blue-600">{userPw}</span>
      </p>

      <div className="flex flex-wrap gap-4">
        {items.map((item) => {
          const owned = !!userItems[item.itemId];
          const canUsePw = item.type === "髱定勠";
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

      {/* 反 3菴捺純縺｣縺ｦ繧九°繝√ぉ繝・け & 繧ｬ繝√Ε貍泌・ */}
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
                  alt="繝翫ン繧ｭ繝｣繝ｩ"
                  className="w-20 h-20 object-contain"
                />
              )}

              <div className="flex-1 text-left">
                <p className="text-sm text-gray-800 mb-2">
                  <span className="font-bold text-yellow-700">縲後ｄ縺｣縺溘・・・菴薙さ繝ｳ繝励Μ繝ｼ繝医□繧茨ｼ√・/span><br />
                  縺薙・繝√Ε繝ｳ繧ｹ繧定ｦ矩・☆縺ｪ・・br />
                  蜍慕判繧定ｦ九◆繧・0%縺ｮ遒ｺ邇・〒繝励Ξ繝溘い縺後ｂ繧峨∴繧九°繧やｦ廠
                </p>
                <button
                  className="px-6 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                  onClick={() => setShowGachaModal(true)}
                >
                  笆ｶ・・蜍慕判繧定ｦ九※繧ｬ繝√Ε繧貞ｼ輔￥
                </button>
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* 磁 繧ｬ繝√Ε蜍慕判繝｢繝ｼ繝繝ｫ */}
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
