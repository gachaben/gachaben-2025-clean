// 🔧 ファイル：src/pages/BattleStartPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";

const BattleStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userItems, setUserItems] = useState([]);
  const [userItemPowers, setUserItemPowers] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [questionCount, setQuestionCount] = useState(3);

  const enemy = "カブトムシくん";

  // 🔹 選択されたアイテム（locationから）
  useEffect(() => {
    const selected = location.state?.selectedItem;
    if (!selected) {
      // ❗️選ばれていない場合は戻す
      navigate("/battle/select-item");
      return;
    }

    setSelectedItem(selected);
  }, [location.state, navigate]);

  // 🔹 ユーザーアイテムとパワー取得（一覧用）
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

      setUserItems(itemList);
    };

    fetchAll();
  }, []);

  // 🔹 バトルへ進む
  const handleStartBattle = () => {
    if (!selectedItem) return;

    navigate("/battle", {
      state: {
        selectedItem,
        enemy,
        questionCount,
      },
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">問題数を選んでね！</h2>

      <div className="flex gap-2 mb-4">
        {[1, 3, 5].map((count) => (
          <button
            key={count}
            className={`px-4 py-2 rounded ${
              questionCount === count ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
            onClick={() => setQuestionCount(count)}
          >
            {count}問
          </button>
        ))}
      </div>

      <button
        onClick={handleStartBattle}
        className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
        disabled={!selectedItem}
      >
        バトルスタート！
      </button>

      {/* 🔽 参考用：選ばれたアイテムを表示 */}
      {selectedItem && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">選ばれたアイテム：</h3>
          <ItemCard item={selectedItem} />
        </div>
      )}
    </div>
  );
};

export default BattleStartPage;
