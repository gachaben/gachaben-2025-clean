import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import ItemCard from "../components/ItemCard";

const ZukanDetailPage = () => {
  const { seriesId } = useParams(); // 萓・ "kontyu"
  const [allItems, setAllItems] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [pwMode, setPwMode] = useState(false); // 笨・PW繝｢繝ｼ繝牙・譖ｿ

  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      // 笨・謇謖√い繧､繝・Β蜿門ｾ・
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const owned = userData?.items || [];
      setUserItems(owned);

      // 笨・繧｢繧､繝・Β荳隕ｧ蜿門ｾ・
      const snapshot = await getDocs(collection(db, "items"));
      const allData = snapshot.docs.map((doc) => doc.data());

      // 笨・seriesId縺ｧ繝輔ぅ繝ｫ繧ｿ繝ｼ
      const filteredItems = allData.filter((item) => item.seriesId === seriesId);
      console.log("蜿門ｾ励＠縺溘い繧､繝・Β・・, filteredItems);
      setAllItems(filteredItems);
    });

    return () => unsubscribe();
  }, [seriesId]);

  if (!seriesId) {
    return <div>繧ｷ繝ｪ繝ｼ繧ｺID縺梧欠螳壹＆繧後※縺・∪縺帙ｓ縲・/div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>kontyu 繧ｷ繝ｪ繝ｼ繧ｺ - {seriesId.toUpperCase()} 繝ｩ繝ｳ繧ｯ縺ｮ繧｢繧､繝・Β荳隕ｧ</h2>

      {/* 笨・PW繝｢繝ｼ繝牙・譖ｿ繝懊ち繝ｳ */}
      <button
        onClick={() => setPwMode((prev) => !prev)}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4 mb-6"
      >
        {pwMode ? "PW繝｢繝ｼ繝芽ｧ｣髯､" : "PW繧剃ｽｿ縺・}
      </button>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {allItems.map((item) => (
          <ItemCard
            key={item.itemId}
            item={item}
            owned={userItems.includes(item.itemId)}
            highestZone={"逾槫喧"}
            pwMode={pwMode} // 笨・ItemCard縺ｫ貂｡縺・
          />
        ))}
      </div>
    </div>
  );
};

export default ZukanDetailPage;
