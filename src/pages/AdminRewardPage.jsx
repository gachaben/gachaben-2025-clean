import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/fbkit";
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
        // 繝ｭ繧ｰ繧､繝ｳ縺励※縺・↑縺・ｴ蜷医・繝ｭ繧ｰ繧､繝ｳ繝壹・繧ｸ縺ｸ
        navigate("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      if (userData?.role === "admin") {
        setIsAdmin(true);
      } else {
        alert("縺薙・繝壹・繧ｸ縺ｯ邂｡逅・・ｰら畑縺ｧ縺吶・);
        navigate("/"); // 縺ｾ縺溘・ "/child-home" 縺ｪ縺ｩ驕ｩ蛻・↑蝣ｴ謇縺ｸ
      }

      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleClick = async () => {
    try {
      await assignTournamentRewards();
      alert("蝣ｱ驟ｬ繧帝・蟶・＠縺ｾ縺励◆・・);
    } catch (error) {
      console.error("蝣ｱ驟ｬ驟榊ｸ・お繝ｩ繝ｼ:", error);
      alert("蝣ｱ驟ｬ驟榊ｸ・ｸｭ縺ｫ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-lg">遒ｺ隱堺ｸｭ...</div>;
  }

  return (
    isAdmin && (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">醇 繝医・繝翫Γ繝ｳ繝亥ｱ驟ｬ驟榊ｸ・/h1>
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          ･・蝣ｱ驟ｬ繧剃ｸ諡ｬ驟榊ｸ・☆繧・
        </button>
      </div>
    )
  );
};

export default AdminRewardPage;
