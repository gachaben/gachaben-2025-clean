// 🔧 src/pages/ZukanListPage.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// ステージごとの枠色
const getBorderColor = (stage) => {
  switch (stage) {
    case 1: return "border-green-400";
    case 2: return "border-yellow-400";
    case 3: return "border-blue-400";
    case 4: return "border-purple-400";
    default: return "border-gray-300";
  }
};

// パワーに応じたゾーン名
const getZoneName = (pw) => {
  if (pw >= 2000) return "神化ゾーン";
  if (pw >= 1500) return "超越ゾーン";
  if (pw >= 1000) return "爆裂ゾーン";
  return "ノーマル";
};

const ZukanListPage = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserItems = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        console.log("❌ ログインしていません");
        return;
      }
      setUserId(user.uid);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const ownedItemIds = userData.items || [];

      const snapshot = await getDocs(collection(db, "items"));
      const allItems = snapshot.docs.map((doc) => ({
        ...doc.data(),
        itemId: doc.id, // ✅ ドキュメントIDを付ける！
      }));

      const matchedItems = allItems.filter((item) =>
        ownedItemIds.includes(item.itemId)
      );

      console.log("✅ 表示対象アイテム数：", matchedItems.length);
      setItems(matchedItems);
    };

    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (user) fetchUserItems();
    });

    return () => unsubscribe();
  }, []);

  const handlePowerUp = async (amount) => {
    if (!selectedItem || !userId) return;

    const itemRef = doc(db, "items", selectedItem.itemId);
    const newPw = selectedItem.pw + amount;
    await updateDoc(itemRef, { pw: newPw });

    setItems((prev) =>
      prev.map((item) =>
        item.itemId === selectedItem.itemId
          ? { ...item, pw: newPw }
          : item
      )
    );
    setSelectedItem(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">シリーズ図鑑：</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className={`w-[120px] overflow-hidden border-4 rounded-xl p-2 text-center cursor-pointer ${getBorderColor(
              item.stage
            )}`}
            onClick={() => setSelectedItem(item)}
          >
            <img
              src={`/images/kontyu/stage${item.stage}/${item.imageName.replace(".png", "")}.png`} // ✅ 拡張子調整
              alt={item.name}
              className="w-full h-auto"
            />
            <p className="font-bold text-center leading-tight text-sm break-words line-clamp-2 h-[2.6em]">
              {item.name}
            </p>
            <p className="text-xs text-gray-600">パワー：{item.pw}</p>
            <p className="text-xs text-red-600">{getZoneName(item.pw)}</p>
          </div>
        ))}
      </div>

      {/* モーダル表示 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 text-center shadow-lg">
            <h2 className="text-lg font-bold mb-2">{selectedItem.name}</h2>
            <p className="text-sm mb-2">いまのパワー：{selectedItem.pw}</p>
            <p className="text-sm mb-4 text-red-600">
              {getZoneName(selectedItem.pw)}
            </p>
            <div className="flex justify-center space-x-2">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={() => handlePowerUp(100)}
              >
                +100 注ぐ
              </button>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                onClick={() => handlePowerUp(200)}
              >
                +200 注ぐ
              </button>
              <button
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                onClick={() => setSelectedItem(null)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZukanListPage;
