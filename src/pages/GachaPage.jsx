// @KEEP 逅・罰: 譟ｱ・遺擘/繧ｬ繝√Ε/繝溘ャ繧ｷ繝ｧ繝ｳ/繝ｩ繝ｳ繧ｭ繝ｳ繧ｰ/蝠城｡悟ｱ･豁ｴ・峨↓荳閾ｴ
// src/pages/GachaPage.jsx
import React, { useState } from "react";
import GachaAnimation from "../components/GachaAnimation";
import GachaResult from "../components/GachaResult"; // 邨先棡陦ｨ遉ｺ逕ｨ繧ｳ繝ｳ繝昴・繝阪Φ繝・

export default function GachaPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [drawnItem, setDrawnItem] = useState(null);

  const startGacha = () => {
    setIsPlaying(true);
    // 縺薙％縺ｧ蜉ｹ譫憺浹蜀咲函繧０K・医ｂ縺礼畑諢上＠縺ｦ縺ゅｌ縺ｰ・・
  };

  const finishGacha = () => {
    const item = performGacha(); // 繧ｬ繝√Ε繝ｭ繧ｸ繝・け縺ｧ繧｢繧､繝・Β蜿門ｾ・
    setDrawnItem(item);
    setIsPlaying(false);
  };

  return (
    <div className="text-center p-4">
      <button onClick={startGacha} className="btn-primary mb-4">
        繧ｬ繝√Ε繧貞屓縺呻ｼ・
      </button>

      {isPlaying ? (
        <GachaAnimation onFinish={finishGacha} />
      ) : (
        drawnItem && <GachaResult item={drawnItem} />
      )}
    </div>
  );
}
