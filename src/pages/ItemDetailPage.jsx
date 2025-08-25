import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ItemDetailPage = ({ docId, item }) => {
  const navigate = useNavigate();

  const handleEvolveClick = () => {
    if (!docId || !item?.stage) {
      alert("蠢・ｦ√↑諠・ｱ縺御ｸ崎ｶｳ縺励※縺・∪縺・);
      return;
    }
    navigate("/evolve-roulette", {
      state: {
        docId: docId,
        currentStage: item.stage,
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ｪｲ 繧｢繧､繝・Β縺ｮ縺励ｇ縺・＆縺・/h2>

      <div className="mb-4">
        <p><strong>ID:</strong> {docId}</p>
        <p><strong>縺ｪ縺ｾ縺・</strong> {item?.name || "蜷榊燕縺ｪ縺・}</p>
        <p><strong>繧ｹ繝・・繧ｸ:</strong> {item?.stage || "荳肴・"}</p>
        {/* 莉悶・諠・ｱ繧ょｿ・ｦ√↑繧峨％縺薙↓霑ｽ蜉・・*/}
      </div>

      <button
  className="bg-green-500 text-white px-4 py-2 rounded"
  onClick={() => navigate("/evolve-drag", { state: { docId, currentStage } })}
>
  縺励ｓ縺九＆縺帙ｋ・・
</button>

    </div>
  );
};

export default ItemDetailPage;
