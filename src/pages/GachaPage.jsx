// src/pages/GachaPage.jsx
import React, { useState } from "react";
import GachaAnimation from "../components/GachaAnimation";
import GachaResult from "../components/GachaResult"; // 結果表示用コンポーネント

export default function GachaPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawnItem, setDrawnItem] = useState(null);

  const startGacha = () => {
    setIsPlaying(true);
    // ここで効果音再生もOK（もし用意してあれば）
  };

  const finishGacha = () => {
    const item = performGacha(); // ガチャロジックでアイテム取得
    setDrawnItem(item);
    setIsPlaying(false);
  };

  return (
    <div className="text-center p-4">
      <button onClick={startGacha} className="btn-primary mb-4">
        ガチャを回す！
      </button>

      {isPlaying ? (
        <GachaAnimation onFinish={finishGacha} />
      ) : (
        drawnItem && <GachaResult item={drawnItem} />
      )}
    </div>
  );
}
