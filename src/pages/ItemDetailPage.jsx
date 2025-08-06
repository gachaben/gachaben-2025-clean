import React from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ItemDetailPage = ({ docId, item }) => {
  const navigate = useNavigate();

  const handleEvolveClick = () => {
    if (!docId || !item?.stage) {
      alert("必要な情報が不足しています");
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
      <h2 className="text-xl font-bold mb-4">🪲 アイテムのしょうさい</h2>

      <div className="mb-4">
        <p><strong>ID:</strong> {docId}</p>
        <p><strong>なまえ:</strong> {item?.name || "名前なし"}</p>
        <p><strong>ステージ:</strong> {item?.stage || "不明"}</p>
        {/* 他の情報も必要ならここに追加！ */}
      </div>

      <button
  className="bg-green-500 text-white px-4 py-2 rounded"
  onClick={() => navigate("/evolve-drag", { state: { docId, currentStage } })}
>
  しんかさせる！
</button>

    </div>
  );
};

export default ItemDetailPage;
