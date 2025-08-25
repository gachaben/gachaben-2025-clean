// src/pages/BattleRankSelectPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const BattleRankSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-6">
      <h2 className="text-xl font-bold mb-6">笞費ｸ・繝ｩ繝ｳ繧ｯ繧帝∈繧薙〒繝舌ヨ繝ｫ繧ｭ繝｣繝ｩ繧呈ｱｺ繧√ｈ縺・ｼ・/h2>

      <div className="flex gap-6">
        {/* S繝ｩ繝ｳ繧ｯ・磯≡・・*/}
        <button
          onClick={() => navigate("/zukan/kontyu/S")}
          className="px-6 py-3 rounded text-white font-bold shadow-md"
          style={{ backgroundColor: "#FFD700" }} // 驥題牡
        >
          S繝ｩ繝ｳ繧ｯ縺ｧ謌ｦ縺・ｼ・
        </button>

        {/* A繝ｩ繝ｳ繧ｯ・郁ｵ､・・*/}
        <button
          onClick={() => navigate("/zukan/kontyu/A")}
          className="px-6 py-3 rounded text-white font-bold shadow-md bg-red-500 hover:bg-red-600"
        >
          A繝ｩ繝ｳ繧ｯ縺ｧ謌ｦ縺・ｼ・
        </button>

        {/* B繝ｩ繝ｳ繧ｯ・育ｷ托ｼ・*/}
        <button
          onClick={() => navigate("/zukan/kontyu/B")}
          className="px-6 py-3 rounded text-white font-bold shadow-md bg-green-500 hover:bg-green-600"
        >
          B繝ｩ繝ｳ繧ｯ縺ｧ謌ｦ縺・ｼ・
        </button>
      </div>
    </div>
  );
};

export default BattleRankSelectPage;
