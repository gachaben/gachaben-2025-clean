import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import ItemCard from "../components/ItemCard";
import { db } from "../firebase";

const ZukanDetailPage = () => {
  const { seriesId } = useParams(); // 例: "kontyu"
  const [allItems, setAllItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [pwMode, setPwMode] = useState(false); // ✅ PWモード切替

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // ✅ 所持アイテム取得
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const owned = userData?.items || [];
      setUserItems(owned);

      // ✅ アイテム一覧取得
      const snapshot = await getDocs(collection(db, "items"));
      const allData = snapshot.docs.map((doc) => doc.data());

      // ✅ seriesIdでフィルター
      const filteredItems = allData.filter((item) => item.seriesId === seriesId);
      console.log("取得したアイテム：", filteredItems);
      setAllItems(filteredItems);
    });

    return () => unsubscribe();
  }, [seriesId]);

  if (!seriesId) {
    return <div>シリーズIDが指定されていません。</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>kontyu シリーズ - {seriesId.toUpperCase()} ランクのアイテム一覧</h2>

      {/* ✅ PWモード切替ボタン */}
      <button
        onClick={() => setPwMode((prev) => !prev)}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4 mb-6"
      >
        {pwMode ? "PWモード解除" : "PWを使う"}
      </button>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {allItems.map((item) => (
          <ItemCard
            key={item.itemId}
            item={item}
            owned={userItems.includes(item.itemId)}
            highestZone={"神化"}
            pwMode={pwMode} // ✅ ItemCardに渡す
          />
        ))}
      </div>
    </div>
  );
};

export default ZukanDetailPage;
