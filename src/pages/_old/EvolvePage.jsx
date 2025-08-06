import React, { useEffect, useState } from "react";

const EvolvePage = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("selectedItem");
    if (data) {
      setSelectedItem(JSON.parse(data));
    }
  }, []);

  if (!selectedItem) {
    return <p className="p-4">アイテムが選ばれていません。</p>;
  }

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-4">🌱 進化するよ！</h2>
      <img
        src={`/images/kontyu/${selectedItem.stage}/${selectedItem.itemId}.png`}
        alt={selectedItem.itemId}
        className="w-40 mx-auto mb-4"
      />
      <p>いまのステージ：{selectedItem.stage}</p>
      {/* ここに進化ルーレットやボタンを追加していきます */}
      <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
        🌟 しんかスタート！
      </button>
    </div>
  );
};

export default EvolvePage;
