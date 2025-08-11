import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ItemCard from "../components/ItemCard";
import PwUseModal from "../components/PwUseModal";
import CptUseModal from "../components/CptUseModal";
import BptUseModal from "../components/BptUseModal";
import { db } from "../firebase";

const ZukanSeriesPage = () => {
  const { seriesId, rank } = useParams();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [userItems, setUserItems] = useState({});
  const [userPw, setUserPw] = useState(0);
  const [userCpt, setUserCpt] = useState(0);
  const [userBpt, setUserBpt] = useState(0);
  const [oshiId, setOshiId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [highestZones, setHighestZones] = useState({});

  const [isPwMode, setIsPwMode] = useState(false);
  const [isCptMode, setIsCptMode] = useState(false);
  const [isBptMode, setIsBptMode] = useState(false);
  const [isBattleMode, setIsBattleMode] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const ownedItems = userData.items || {};

      setUserItems(ownedItems);
      setUserPw(userData.pw || 0);
      setUserCpt(userData.cpt || 0);
      setUserBpt(userData.bpt || 0);
      setOshiId(userData.oshiCharacterId || null);

      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("seriesId", "==", seriesId), where("rank", "==", rank));
      const snapshot = await getDocs(q);
      const allItems = snapshot.docs.map(doc => ({ ...doc.data(), itemId: doc.id }));

      const maxStageMap = {};
      allItems.forEach(item => {
        const key = item.name;
        const userStats = ownedItems[item.itemId] || {};
        const userPw = userStats.pw || 0;
        const userCpt = userStats.cpt || 0;
        const userBpt = userStats.bpt || 0;

        if (!maxStageMap[key] || item.stage > maxStageMap[key].stage) {
          maxStageMap[key] = {
            ...item,
            pw: userPw,
            cpt: userCpt,
            bpt: userBpt,
          };
        }
      });
      setFilteredItems(Object.values(maxStageMap).slice(0, 10));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [seriesId, rank]);

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

      setFilteredItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === itemId
            ? { ...item, pw: (item.pw || 0) + amount }
            : item
        )
      );

      setUserPw((prev) => prev - amount);
    } catch (error) {
      alert("PWの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const handleUseCpt = async (amount) => {
    if (!selectedItem) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    const itemId = selectedItem.itemId;

    try {
      await updateDoc(userRef, {
        [`items.${itemId}.cpt`]: increment(amount),
        cpt: increment(-amount),
      });

      setUserItems((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          cpt: (prev[itemId]?.cpt || 0) + amount,
        },
      }));

      setUserCpt((prev) => prev - amount);
    } catch (error) {
      alert("Cptの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const handleUseBpt = async (amount) => {
    if (!selectedItem) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);
    const itemId = selectedItem.itemId;

    try {
      await updateDoc(userRef, {
        [`items.${itemId}.bpt`]: increment(amount),
        bpt: increment(-amount),
      });

      setUserItems((prev) => ({
        ...prev,
        [itemId]: {
          ...(prev[itemId] || {}),
          bpt: (prev[itemId]?.bpt || 0) + amount,
        },
      }));

      setUserBpt((prev) => prev - amount);
    } catch (error) {
      alert("Bptの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const oshiImagePath = oshiId ? `/images/oshi/oshi_${oshiId}.png` : null;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        {seriesId} シリーズ・{rank} ランクのアイテム一覧
      </h2>

      <div className="mb-2 text-right text-gray-700 font-bold">
        あなたの所持PW：<span className="text-blue-600">{userPw}</span><br />
        あなたの所持Cpt：<span className="text-red-500">{userCpt}</span><br />
        あなたの所持Bpt：<span className="text-blue-500">{userBpt}</span>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        <button
          className={`px-4 py-2 rounded font-bold text-white ${isPwMode ? "bg-red-500" : "bg-blue-500"}`}
          onClick={() => {
            setIsPwMode(!isPwMode);
            setIsCptMode(false);
            setIsBptMode(false);
            setIsBattleMode(false);
          }}
        >
          {isPwMode ? "PW使用中！" : "PWを使う"}
        </button>

        <button
          className={`px-4 py-2 rounded font-bold text-white ${isCptMode ? "bg-red-500" : "bg-blue-500"}`}
          onClick={() => {
            setIsCptMode(!isCptMode);
            setIsPwMode(false);
            setIsBptMode(false);
            setIsBattleMode(false);
          }}
        >
          {isCptMode ? "Cpt使用中！" : "Cptを使う"}
        </button>

        <button
          className={`px-4 py-2 rounded font-bold text-white ${isBptMode ? "bg-red-500" : "bg-blue-500"}`}
          onClick={() => {
            setIsBptMode(!isBptMode);
            setIsPwMode(false);
            setIsCptMode(false);
            setIsBattleMode(false);
          }}
        >
          {isBptMode ? "Bpt使用中！" : "Bptを使う"}
        </button>

        <button
          className={`px-4 py-2 rounded font-bold text-white ${isBattleMode ? "bg-yellow-500" : "bg-gray-700"}`}
          onClick={() => {
            setIsBattleMode(!isBattleMode);
            setIsPwMode(false);
            setIsCptMode(false);
            setIsBptMode(false);
          }}
        >
          {isBattleMode ? "バトル選択中！" : "バトルで使う！"}
        </button>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const imageName = item.imageName || item.name;
              const imagePath = `/images/${item.seriesId}/stage${item.stage}/${imageName}.png`;

              return (
                <div
                  key={item.itemId}
                  onClick={() => {
                    if (isPwMode || isCptMode || isBptMode) {
                      setSelectedItem(item);
                    } else if (isBattleMode) {
                      const selected = {
                        ...item,
                        imagePath,
                        imageName,
                        rank: item.rank,
                        pw: item.pw || 0,
                        cpt: item.cpt || 0,
                        bpt: item.bpt || 0,
                      };
                      navigate("/battle/start", { state: { selectedItem: selected } });
                    } else {
                      navigate(`/zukan/${seriesId}/${rank}/${item.name}`);
                    }
                  }}
                >
                  <ItemCard
                    key={item.itemId}
                    item={item}
                    owned={userItems[item.itemId]}
                    highestZone={highestZones[item.itemId]}
                    onClick={() => {}}
                    pwMode={isPwMode}
                    cptMode={isCptMode}
                    bptMode={isBptMode}
                  />
                </div>
              );
            })
          ) : (
            <p>このランクのアイテムは見つかりません。</p>
          )}
        </div>
      )}

      {oshiImagePath && (
        <img
          src={oshiImagePath}
          alt="ナビキャラ"
          className="fixed bottom-4 right-4 w-24 h-24 object-contain z-50"
        />
      )}

      {selectedItem && isPwMode && (
        <PwUseModal
          item={selectedItem}
          userPw={userPw}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleUsePw}
        />
      )}

      {selectedItem && isCptMode && (
        <CptUseModal
          item={selectedItem}
          userCpt={userCpt}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleUseCpt}
        />
      )}

      {selectedItem && isBptMode && (
        <BptUseModal
          item={selectedItem}
          userBpt={userBpt}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleUseBpt}
        />
      )}
    </div>
  );
};

export default ZukanSeriesPage;
