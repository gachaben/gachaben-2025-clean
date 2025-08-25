// 笨・繝輔ぃ繧､繝ｫ・嘖rc/components/BptUseModal.jsx
import React, { useState, useEffect } from 'react';

const BptUseModal = ({ item, userBpt, onClose, onConfirm }) => {
  const [selected, setSelected] = useState(50);
  const [isOver, setIsOver] = useState(false);
  const options = [50, 100, 150, 200, 250];

  useEffect(() => {
    setIsOver(selected > userBpt);
  }, [selected, userBpt]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl w-80 text-center relative">
        <h2 className="text-lg font-bold mb-4">Bpt菴ｿ逕ｨ驥上ｒ驕ｸ繧薙〒縺上□縺輔＞</h2>

        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {options.map((amount) => (
            <button
              key={amount}
              className={`px-3 py-1 rounded border ${selected === amount ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setSelected(amount)}
            >
              {amount}
            </button>
          ))}
        </div>

        <p className="mb-2">縺ゅ↑縺溘・謇謖。pt・嘴userBpt}</p>
        {isOver && <p className="text-red-500">Bpt縺瑚ｶｳ繧翫∪縺帙ｓ・・/p>}

        <div className="flex justify-around mt-4">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">繧ｭ繝｣繝ｳ繧ｻ繝ｫ</button>
          <button
            onClick={() => !isOver && onConfirm(selected)}
            className={`px-4 py-2 rounded ${isOver ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          >
            豎ｺ螳・
          </button>
        </div>
      </div>
    </div>
  );
};

export default BptUseModal;
