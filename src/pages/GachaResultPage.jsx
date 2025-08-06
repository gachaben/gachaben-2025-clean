// src/pages/GachaResultPage.jsx

import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getRandomReward } from "../utils/gachaReward"; // ← ガチャ報酬関数（別途作成してね）

const GachaResultPage = () => {
  const [reward, setReward] = useState(null);
  const [oshi, setOshi] = useState("nyan"); // デフォルト（にゃん）
  const [showRetry, setShowRetry] = useState(false);

  // 🔸 ユーザーの推しキャラを取得
  useEffect(() => {
    const fetchOshi = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setOshi(data.oshi || "nyan");
      }
    };
    fetchOshi();
  }, []);

  // 🔸 初回ガチャ結果を表示
  useEffect(() => {
    const reward = getRandomReward(); // ランダム報酬関数（チャンスカード or pw）
    setReward(reward);
  }, []);

  // 🔸 再抽選用
  const handleRetry = async () => {
    // 仮の広告視聴処理（あとで差し替えOK）
    const confirmed = window.confirm("広告をさいごまでみましたか？");
    if (confirmed) {
      const reward = getRandomReward();
      setReward(reward);
      setShowRetry(false); // 2回目以降は無効
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">🎉 ガチャけっか 🎉</h2>

      {reward && (
        <div className="mb-4">
          <p className="text-lg">👉 もらったもの：{reward.label}</p>
        </div>
      )}

      {/* 🔸 推しキャラの案内セリフ */}
      {showRetry && (
        <div className="mb-4">
          <img
            src={`/images/oshi/${oshi}.png`}
            alt="推しキャラ"
            className="w-32 h-32 mx-auto"
          />
          <p className="mt-2 font-bold">
            「🎦 どうがをみたら、もういっかい ガチャが ひけるんだって！」
          </p>
        </div>
      )}

      {/* 🔸 再抽選ボタン */}
      {!showRetry ? (
        <button
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          onClick={() => setShowRetry(true)}
        >
          🎦 どうがをみて もういっかい ガチャ！
        </button>
      ) : (
        <button
          className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
          onClick={handleRetry}
        >
          ✅ さいごまで見たよ！ガチャもういっかい！
        </button>
      )}
    </div>
  );
};

export default GachaResultPage;
