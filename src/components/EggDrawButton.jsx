import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const EggDrawButton = () => {
  const [drawnEggs, setDrawnEggs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // 全10種（egg001〜egg010）
  const allEggs = [
    "egg001", "egg002", "egg003", "egg004", "egg005",
    "egg006", "egg007", "egg008", "egg009", "egg010",
  ];

  // 出やすさ（低いほど出にくい）: weight = 出る確率
  const weights = {
    egg001: 1,
    egg002: 1,
    egg003: 3,
    egg004: 3,
    egg005: 3,
    egg006: 3,
    egg007: 3,
    egg008: 3,
    egg009: 3,
    egg010: 3,
  };

  useEffect(() => {
    const fetchDrawnEggs = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const docRef = doc(db, "userItemPowers", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setDrawnEggs(Object.keys(snap.data()));
      }
      setLoading(false);
    };
    fetchDrawnEggs();
  }, []);

  const drawEgg = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 抽選対象：まだ持ってない卵
    const remaining = allEggs.filter((eggId) => !drawnEggs.includes(eggId));

    if (remaining.length === 0) {
      alert("すでにすべてのたまごを集めました！");
      return;
    }

    // 重み付き抽選
    const weighted = remaining.flatMap((id) => Array(weights[id]).fill(id));
    const chosen = weighted[Math.floor(Math.random() * weighted.length)];

    // Firestore に保存
    const userItemRef = doc(db, "userItemPowers", user.uid);
    await setDoc(
      userItemRef,
      {
        [chosen]: {
          stage: "egg",
          power: 0,
        },
      },
      { merge: true }
    );

    setDrawnEggs((prev) => [...prev, chosen]);
    setResult(chosen);
  };

  if (loading) return <p>読み込み中...</p>;

  return (
    <div className="text-center mt-6">
      <button
        onClick={drawEgg}
        className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 transition"
      >
        たまごをうけとる！
      </button>

      {result && (
        <div className="mt-4">
          <img
            src={`/images/kontyu/egg/${result}.png`}
            alt={result}
            className="w-32 mx-auto"
          />
          <p className="mt-2 text-lg font-bold">{result} をゲット！</p>
        </div>
      )}
    </div>
  );
};

export default EggDrawButton;
