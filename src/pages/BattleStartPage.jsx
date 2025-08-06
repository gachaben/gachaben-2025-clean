import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";
import { useLocation } from "react-router-dom";

const BattleStartPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userItems, setUserItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});

  // ✅ location.state から受け取る（Zukanから来た場合）
  const [selectedItem, setSelectedItem] = useState(location.state?.selectedItem || null);
  const [questionCount, setQuestionCount] = useState(location.state?.questionCount || 3);

  const enemy = "カブトムシくん";

  useEffect(() => {
    const fetchAll = async () => {
      const user = getAuth().currentUser;
      if (!user) return;

      const itemSnap = await getDoc(doc(db, "userItems", user.uid));
      const rawItems = itemSnap.exists() ? itemSnap.data() : {};

      const powersSnap = await getDocs(collection(db, "userItemPowers", user.uid, "items"));
      const powers = {};
      powersSnap.forEach((doc) => {
        powers[doc.id] = doc.data();
      });

      setUserItemPowers(powers);

      const itemList = Object.entries(rawItems).map(([id, data]) => ({
        itemId: id,
        ...data,
        ...powers[id],
      }));

      console.log("📦 マージ済みアイテム：", itemList);
      setUserItems(itemList);
    };

    fetchAll();
  }, []);

  const handleStartBattle = () => {
    if (!selectedItem) return;

    console.log("🧩 選択アイテム：", selectedItem);

    navigate("/battle", {
      state: {
        selectedItem,
        enemy,
        questionCount,
      },
    });
  };


  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-4">⚔️ バトル準備</h1>

      {/* 問題数選択 */}
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

      {/* アイテム選択 */}
      <p className="text-center font-bold mb-2">使うアイテムを1つえらぼう！</p>
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

      {/* バトル開始ボタン */}
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
