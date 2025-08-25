import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { getImageByStage } from "../../utils/getImageByStage";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { itemNameMap } from "../../utils/item_Kontyu_Names";

// ランキング対象アイテムID一覧
const itemIds = [
  "egg001",
  "egg002",
  "egg003",
  "egg004",
  "egg005",
  "egg006",
  "egg007",
  "egg008",
  "egg009",
  "egg010",
];

const AllRankingPage = () => {
  const [rankings, setRankings] = useState({});
  const navigate = useNavigate();

  // 🔐 認証チェックとデータ取得
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("ログインしていません");
        navigate("/login");
      } else {
        console.log("ログイン中:", user.uid);
        fetchRankings();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRankings = async () => {
    const snapshot = await getDocs(collection(db, "userItemPowers"));
    const allData = {};

    itemIds.forEach((id) => (allData[id] = []));

    snapshot.forEach((doc) => {
      const uid = doc.id;
      const data = doc.data();

      itemIds.forEach((itemId) => {
        const item = data.items?.[itemId];
        if (item) {
          allData[itemId].push({
            uid,
            pw: item.pw,
          });
        }
      });
    });

    // 各アイテムごとにpw降順に並び替え＋上位3つだけ保存
    const result = {};
    itemIds.forEach((itemId) => {
      const sorted = allData[itemId]
        .sort((a, b) => b.pw - a.pw)
        .slice(0, 3);
      result[itemId] = sorted;
    });

    setRankings(result);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">🏆 全キャラ ランキング一覧</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemIds.map((itemId) => (
          <div
            key={itemId}
            className="border p-4 rounded-xl shadow-md bg-white"
          >
            <img
              src={getImageByStage("egg", itemId)}
              alt={itemId}
              className="w-24 h-24 mx-auto mb-2"
            />
            <h3 className="text-lg font-bold text-center mb-2">
              {itemNameMap[itemId] || itemId}
            </h3>

            <ul className="text-sm space-y-1">
              {rankings[itemId]?.map((entry, index) => (
                <li key={entry.uid}>
                  {index + 1}位: {entry.uid.slice(0, 6)}...（{entry.pw} pw）
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate(`/item-ranking/${itemId}`)}
              className="mt-2 w-full bg-blue-500 text-white py-1 rounded-md"
            >
              詳（くわ）しく見（み）る →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRankingPage;
