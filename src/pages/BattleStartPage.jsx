import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";

const BattleStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [authReady, setAuthReady] = useState(false);
  const [userItems, setUserItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [questionCount, setQuestionCount] = useState(3);
  const enemy = "カブトムシくん";

  // ✅ 未ログインなら匿名ログイン → 認証準備完了フラグを立てる
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("🔐 no user -> signInAnonymously()");
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error("❌ signInAnonymously error:", e);
        }
      } else {
        console.log("👤 logged in uid:", user.uid);
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // 🔹 locationから初期選択反映
  useEffect(() => {
    if (location.state?.selectedItem) {
      setSelectedItem(location.state.selectedItem);
      setUserItems((prev) => [
        location.state.selectedItem,
        ...prev.filter(
          (item) => item.itemId !== location.state.selectedItem.itemId
        ),
      ]);
    }
  }, [location.state]);

  // 🔹 アイテム & パワー取得（認証準備ができてから）
  useEffect(() => {
    if (!authReady) return;

    const fetchAll = async () => {
      const user = getAuth().currentUser;
      if (!user) return;
      console.log("📥 fetch for uid:", user.uid);

      const itemSnap = await getDoc(doc(db, "userItems", user.uid));
      const rawItems = itemSnap.exists() ? itemSnap.data() : {};
      console.log("🧾 rawItems:", rawItems);

      const powersSnap = await getDocs(
        collection(db, "userItemPowers", user.uid, "items")
      );
      const powers = {};
      powersSnap.forEach((docu) => {
        powers[docu.id] = docu.data();
      });
      setUserItemPowers(powers);
      console.log("🔋 powers:", powers);

      const itemList = Object.entries(rawItems).map(([id, data]) => ({
        itemId: id,
        ...data,
        ...powers[id],
      }));
      setUserItems(itemList);
      console.log("📦 itemList:", itemList);
    };

    fetchAll();
  }, [authReady]);

  // ✅ バトル開始：/battle/play に state で渡す
  const handleStartBattle = () => {
    if (!selectedItem) return;

    const initialMyPw = selectedItem?.pw ?? 300;
    const initialEnemyPw = 300;

    const enemyItem = {
      id: "cpu001",
      name: enemy,
      power: initialEnemyPw,
    };

    navigate("/battle/play", {
      state: {
        selectedItem,
        enemyItem,
        myPwLeft: initialMyPw,
        enemyPwLeft: initialEnemyPw,
        questionCount,
      },
    });
  };

  // まだログイン確定前はローディング
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">ログイン準備中…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">⚔️ バトル準備</h1>

      {/* 🔸 問題数選択 */}
      <div className="text-center mb-6">
        <p className="mb-2 font-bold">バトルの問題数をえらんでね</p>
        {[1, 3, 5].map((num) => (
          <button
            key={num}
            onClick={() => setQuestionCount(num)}
            className={`mx-2 px-4 py-2 rounded-full border font-bold ${
              questionCount === num
                ? "bg-green-500 text-white"
                : "bg-white text-green-500 border-green-500"
            }`}
          >
            {num}問
          </button>
        ))}
      </div>

      {/* 🔸 アイテム選択 */}
      <div className="flex flex-wrap justify-center">
        {userItems.map((item) => (
          <div
            key={item.itemId}
            onClick={() => setSelectedItem(item)}
            className={`cursor-pointer ${
              selectedItem?.itemId === item.itemId ? "ring-4 ring-blue-400" : ""
            }`}
          >
            <ItemCard item={item} owned={true} />
          </div>
        ))}
      </div>

      {/* 🔸 バトル開始 */}
      <div className="text-center mt-6">
        <button
          onClick={handleStartBattle}
          disabled={!selectedItem}
          className={`px-6 py-3 rounded-lg font-bold shadow ${
            selectedItem
              ? "bg-blue-500 text-white"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          バトルスタート！
        </button>
      </div>
    </div>
  );
};

export default BattleStartPage;
