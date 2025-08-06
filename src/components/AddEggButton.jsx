import React from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebase"; // ←自分の構成に合わせて調整してね！

const AddEggButton = () => {
  const handleAddEgg = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインしてください！");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        ownedEggs: arrayUnion("egg001"), // ←ここに追加したいID
      });
      alert("たまごを登録しました！");
    } catch (error) {
      console.error("登録エラー:", error);
      alert("登録に失敗しました");
    }
  };

  return (
    <button
      onClick={handleAddEgg}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      egg001を追加
    </button>
  );
};

export default AddEggButton;
