// src/pages/BattleItemSelectPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // ← あなたのプロジェクトに合わせて調整

const BattleItemSelectPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  // Firestoreからitemsを取得
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, "items"));
        const itemList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // フィルタしたければここでできる（例：stage === 3のみなど）
        setItems(itemList);
      } catch (error) {
        console.error("アイテム取得エラー:", error);
      }
    };

    fetchItems();
  }, []);

  const handleSelect = (item) => {
    navigate("/battle/start", {
      state: {
        selectedItem: item,
      },
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-4">⚔️ バトルに使うキャラを選ぼう！</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const imagePath = `/images/${item.seriesId}/stage${item.stage}/${item.imageName}.png`;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg"
              onClick={() => handleSelect(item)}
            >
              <img
                src={imagePath}
                alt={item.name}
                className="w-32 h-32 object-contain mx-auto mb-2"
              />
              <h2 className="text-lg font-semibold text-center">{item.name}</h2>
              <p className="text-center text-sm text-gray-600">
                所持PW：{item.pw ?? 0}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BattleItemSelectPage;
