// src/components/EggDisplay.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const EggDisplay = () => {
  const [eggList, setEggList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEggs = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "userEggs"),
        where("uid", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const eggs = querySnapshot.docs.map((doc) => doc.data());
      setEggList(eggs);
      setLoading(false);
    };

    fetchEggs();
  }, []);

  if (loading) return null;

  // 🟡 卵を持っていないときは何も表示しない
  if (eggList.length === 0) return null;

  const latestEgg = eggList[eggList.length - 1];
  const imagePath = `/images/kontyu/${latestEgg.stage}/${latestEgg.eggId}.png`;

  return (
    <div className="mt-6 text-center">
      <img
        src={imagePath}
        alt="たまご"
        className="w-24 h-24 mx-auto rounded shadow"
      />
      <p className="mt-2 font-bold">{latestEgg.eggId} をゲット！</p>
      <p className="text-sm text-gray-500">たまごを育ててね！</p>
    </div>
  );
};

export default EggDisplay;
