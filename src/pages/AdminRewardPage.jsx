import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import assignTournamentRewards from "../utils/assignTournamentRewards";

const AdminRewardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;

      if (!user) {
        // ログインしていない場合はログインページへ
        navigate("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role === "admin") {
        setIsAdmin(true);
      } else {
        alert("このページは管理者専用です。");
        navigate("/"); // または "/child-home" など適切な場所へ
      }

      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleClick = async () => {
    try {
      await assignTournamentRewards();
      alert("報酬を配布しました！");
    } catch (error) {
      console.error("報酬配布エラー:", error);
      alert("報酬配布中にエラーが発生しました。");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-lg">確認中...</div>;
  }

  return (
    isAdmin && (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🏆 トーナメント報酬配布</h1>
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          🥚 報酬を一括配布する
        </button>
      </div>
    )
  );
};

export default AdminRewardPage;
