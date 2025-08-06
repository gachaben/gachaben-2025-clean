import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const EvolveSelectPage = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvolvableItems = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const q = query(
        collection(db, "userItemPowers"),
        where("uid", "==", uid),
        where("power", ">=", 100)
      );
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        docId: doc.id,
        ...doc.data(),
      }));

      setItems(data);
    };

    fetchEvolvableItems();
  }, []);

  const handleSelect = (item) => {
    navigate("/evolve-roulette", {
      state: {
        docId: item.docId,
        currentStage: item.stage,
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🔍 しんかさせるアイテムをえらぼう！</h2>
      {items.length === 0 ? (
        <p>100パワーたまったアイテムがないよ</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <li
              key={item.docId}
              onClick={() => handleSelect(item)}
              className="cursor-pointer p-2 border rounded hover:bg-gray-100"
            >
              <p>📛 {item.itemId}</p>
              <p>🔋 PW: {item.power}</p>
              <p>📶 いま: {item.stage}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EvolveSelectPage;
