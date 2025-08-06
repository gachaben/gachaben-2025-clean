// ✅ ファイル：src/components/BptUseModal.jsx
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
        <h2 className="text-lg font-bold mb-4">Bpt使用量を選んでください</h2>

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

        <p className="mb-2">あなたの所持Bpt：{userBpt}</p>
        {isOver && <p className="text-red-500">Bptが足りません！</p>}

        <div className="flex justify-around mt-4">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">キャンセル</button>
          <button
            onClick={() => !isOver && onConfirm(selected)}
            className={`px-4 py-2 rounded ${isOver ? 'bg-gray-300' : 'bg-blue-500 text-white'}`}
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
};

export default BptUseModal;
