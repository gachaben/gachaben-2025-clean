import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const BattleResultPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const {
    myBet,
    enemyBet,
    winner,
    myCorrect,
    cpuCorrect,
    selectedItem,     // ← 自分のアイテム（PWを更新する）
    enemyItem,        // ← 仮想相手（表示用）
  } = state || {};

  const [updated, setUpdated] = useState(false); // PW反映済みチェック

  // ✅ ダメージ計算
  let message = "";
  let myDamage = 0;
  let enemyDamage = 0;

  if (winner === "player") {
    enemyDamage = myBet;
    message = `🎉 あなたの勝利！敵に ${enemyDamage} ダメージ！`;
  } else if (winner === "cpu") {
    myDamage = enemyBet;
    message = `💥 敵の勝利…あなたに ${myDamage} ダメージ…`;
  } else {
    message = "🤝 引き分け！おたがいノーダメージ！";
  }

  // ✅ Firestore上の自分のPWを更新する
  const updateMyPw = async () => {
    if (!selectedItem || !selectedItem.itemId || myDamage === 0) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      const docRef = doc(db, "userItemPowers", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const currentPw = data[selectedItem.itemId]?.pw ?? 0;
      const newPw = Math.max(currentPw - myDamage, 0);

      await updateDoc(docRef, {
        [`${selectedItem.itemId}.pw`]: newPw,
      });

      console.log("✅ 自分のPWを更新:", newPw);
      setUpdated(true);
    } catch (err) {
      console.error("🔥 PW更新エラー", err);
    }
  };

  // ✅ 初回マウント時にPW反映
  useEffect(() => {
    if (!updated && myDamage > 0) {
      updateMyPw();
    }
  }, [updated, myDamage]);

  const handleNext = () => {
    navigate("/zukan-top"); // ← 戻り先は自由に
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">🏁 バトル結果発表</h1>

      <div className="bg-white rounded shadow p-6 w-full max-w-md text-center">
        <p className="text-xl font-bold text-green-700 mb-4">{message}</p>

        <div className="mb-4 text-sm text-gray-600">
          <p>あなたの正解数：{myCorrect} 問</p>
          <p>カブトムシくんの正解数：{cpuCorrect} 問</p>
        </div>

        <div className="my-6">
          <p>🧑 あなたの残りPW：<strong>次の画面で反映！</strong></p>
          <p>👑 相手のPW：<strong>今回は仮想なので表示のみ</strong></p>
        </div>

        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600"
          onClick={handleNext}
        >
          つづける
        </button>
      </div>
    </div>
  );
};

export default BattleResultPage;
