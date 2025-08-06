import React from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // ←自分のfirebase設定ファイル名にあわせてね
import { getAuth } from "firebase/auth";

const RegisterStageTest = () => {
  const handleRegister = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("ログインしていません！");
        return;
      }

      // ランダムで egg001〜egg010 を選ぶ
      const randomId = String(Math.floor(Math.random() * 10) + 1).padStart(3, "0");
      const stage = `egg${randomId}`;

      // Firestore に保存（userItemPowers コレクション）
      await setDoc(doc(db, "userItemPowers", user.uid), {
        stage: stage,
      });

      alert(`ステージ "${stage}" を登録しました！`);
    } catch (error) {
      console.error("登録エラー:", error);
      alert("登録に失敗しました");
    }
  };

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">🌱 卵ステージ登録テスト</h1>
      <button
        onClick={handleRegister}
        className="mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        ランダムな卵を登録！
      </button>
    </div>
  );
};

export default RegisterStageTest;
