import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, getDocs, getDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import ItemCard from "../components/ItemCard";
import { useAuth } from "../hooks/useAuth"; // 自作Hookでログイン中ユーザーを取得

const ZukanEvolvePage = () => {
  const { seriesId } = useParams();
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [ownedItemIds, setOwnedItemIds] = useState([]);

  useEffect(() => {
    // Firestoreから指定シリーズのアイテムを取得
    const fetchItems = async () => {
      const itemsRef = collection(db, "items");
      const q = query(itemsRef, where("seriesId", "==", seriesId));
      const snapshot = await getDocs(q);
      const itemsData = snapshot.docs.map((doc) => doc.data());
      setItems(itemsData);
    };

    // Firestoreからログインユーザーの所持アイテムを取得
    const fetchOwnedItems = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setOwnedItemIds(data.items || []);
      }
    };

    fetchItems();
    fetchOwnedItems();
  }, [seriesId, currentUser]);

  // 所持アイテムのみ抽出
  const filteredItems = items.filter((item) => ownedItemIds.includes(item.itemId));

  return (
    <div>
      <h2>進化図鑑：{seriesId}</h2>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filteredItems.map((item) => (
          <ItemCard
            key={item.itemId || `missing-${item.imageName}`}
            item={item}
            isOwned={true} // 所持してるカードだけ表示するので常に true
          />
        ))}
      </div>
    </div>
  );
};

export default ZukanEvolvePage;
