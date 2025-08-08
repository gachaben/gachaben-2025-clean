// src/pages/ZukanSeriesPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ItemCard from "../components/ItemCard";
import PwUseModal from "../components/PwUseModal";
import CptUseModal from "../components/CptUseModal";
import BptUseModal from "../components/BptUseModal";

const LS_BATTLE_KEY = "currentBattleId";
const safeUUID = () =>
  (crypto?.randomUUID?.() ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

export default function ZukanSeriesPage() {
  const { seriesId, rank } = useParams();
  const navigate = useNavigate();

  const [filteredItems, setFilteredItems] = useState([]);
  const [userItems, setUserItems] = useState({}); // users.items（旧データも拾う）
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
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      try {
        // 未ログイン
        if (!user) {
          setFilteredItems([]);
          setUserItems({});
          setUserPw(0);
          setUserCpt(0);
          setUserBpt(0);
          setOshiId(null);
          setLoading(false);
          return;
        }

        // users/{uid} から総量と旧items
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.exists() ? userSnap.data() : {};
        const ownedItems = userData.items || {};
        setUserItems(ownedItems);
        setUserPw(userData.pw || 0);
        setUserCpt(userData.cpt || 0);
        setUserBpt(userData.bpt || 0);
        setOshiId(userData.oshiCharacterId || null);

        // items（シリーズ＆ランク）
        const itemsSnap = await getDocs(
          query(
            collection(db, "items"),
            where("seriesId", "==", seriesId),
            where("rank", "==", rank)
          )
        );
        const allItems = itemsSnap.docs.map((d) => ({ ...d.data(), itemId: d.id }));

        // userItemPowers を userId で一括取得 → itemId で参照
        // （スキーマ想定: docId = `${userId}_${itemId}`, fields: { userId, itemId, pw, cpt, bpt, seriesId? }）
        const powersSnap = await getDocs(
          query(collection(db, "userItemPowers"), where("userId", "==", user.uid))
        );
        const powersMap = {};
        powersSnap.forEach((d) => {
          const v = d.data();
          if (v.itemId) powersMap[v.itemId] = v;
        });

        // 同じ“虫種名”の中で最大stageだけを代表表示 + 所持強化値をマージ
        const maxStageMap = {};
        for (const it of allItems) {
          const key = it.name;
          if (!maxStageMap[key] || it.stage > maxStageMap[key].stage) {
            // 旧users.itemsの値
            const u = ownedItems[it.itemId] || {};
            // 新userItemPowersの値（優先）
            const p = powersMap[it.itemId] || {};
            const mergedPw = (p.pw ?? u.pw ?? 0);
            const mergedCpt = (p.cpt ?? u.cpt ?? 0);
            const mergedBpt = (p.bpt ?? u.bpt ?? 0);

            maxStageMap[key] = {
              ...it,
              pw: mergedPw,
              cpt: mergedCpt,
              bpt: mergedBpt,
            };
          }
        }

        setFilteredItems(Object.values(maxStageMap).slice(0, 10));
      } catch (e) {
        console.error("Zukan load failed:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [auth, db, seriesId, rank]);

  // ---- 強化（PW/Cpt/Bpt）: userItemPowers に書き、users の総量を減らす ----
  const bumpUserAndItem = async (itemId, field, amount) => {
    const user = auth.currentUser;
    if (!user) return;

    // userItemPowers の docId は `uid_itemId`
    const powersRef = doc(db, "userItemPowers", `${user.uid}_${itemId}`);
    const userRef = doc(db, "users", user.uid);

    // 1) item側に increment しつつ、ユーザー総量を減らす
    await setDoc(
      powersRef,
      { userId: user.uid, itemId, [field]: increment(amount) },
      { merge: true }
    );
    await updateDoc(userRef, { [field]: increment(-amount) });

    // 2) フロントの状態も更新
    setFilteredItems((prev) =>
      prev.map((it) =>
        it.itemId === itemId ? { ...it, [field]: (it[field] || 0) + amount } : it
      )
    );
    if (field === "pw") setUserPw((v) => v - amount);
    if (field === "cpt") setUserCpt((v) => v - amount);
    if (field === "bpt") setUserBpt((v) => v - amount);
  };

  const handleUsePw = async (amount) => {
    if (!selectedItem) return;
    try {
      await bumpUserAndItem(selectedItem.itemId, "pw", amount);
    } catch {
      alert("PWの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const handleUseCpt = async (amount) => {
    if (!selectedItem) return;
    try {
      await bumpUserAndItem(selectedItem.itemId, "cpt", amount);
    } catch {
      alert("Cptの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const handleUseBpt = async (amount) => {
    if (!selectedItem) return;
    try {
      await bumpUserAndItem(selectedItem.itemId, "bpt", amount);
    } catch {
      alert("Bptの使用に失敗しました。");
    }
    setSelectedItem(null);
  };

  const oshiImagePath = oshiId ? `/images/oshi/oshi_${oshiId}.png` : null;

  const handleBattleSelect = (item) => {
    const id = safeUUID();
    try { localStorage.setItem(LS_BATTLE_KEY, id); } catch {}
    const imageName = item.imageName || item.name;
    const imagePath = `/images/${item.seriesId}/stage${item.stage}/${imageName}.png`;

    navigate("/battle/item-select", {
      state: {
        battleId: id,
        questionCount: 3,
        selectedItem: {
          ...item,
          imagePath,
          imageName,
          rank: item.rank,
          pw: item.pw || 0,
          cpt: item.cpt || 0,
          bpt: item.bpt || 0,
        },
      },
    });
  };

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
            filteredItems.map((item) => {
              const imageName = item.imageName || item.name;
              const imagePath = `/images/${item.seriesId}/stage${item.stage}/${imageName}.png`;

              return (
                <div
                  key={item.itemId}
                  onClick={() => {
                    if (isPwMode || isCptMode || isBptMode) {
                      setSelectedItem(item);
                    } else if (isBattleMode) {
                      handleBattleSelect(item);
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
}
