import React, { useState, useEffect } from 'react';

const PwUseModal = ({ item, userPw, onClose, onConfirm, onAmountChange }) => {
  const [selected, setSelected] = useState(100);
  const numericUserPw = Number(userPw);

  const options = [100, 200, 300, 400, 500];

  useEffect(() => {
    if (onAmountChange) onAmountChange(selected);
  }, [selected, onAmountChange]);

  const handleSelect = (amount) => {
    if (amount <= numericUserPw) {
      setSelected(amount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg p-6 shadow-xl w-80 text-center">
        <h2 className="text-lg font-bold mb-4">PW使用量を選んでください</h2>

        {/* ボタン選択 */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {options.map((amount) => {
            const isDisabled = amount > numericUserPw;
            const isSelected = selected === amount;

            return (
              <button
                key={amount}
                onClick={() => handleSelect(amount)}
                disabled={isDisabled}
                className={`px-4 py-2 rounded font-bold border text-sm ${
                  isDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isSelected
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {amount}
              </button>
            );
          })}
        </div>

        {/* 所持PW */}
        <p className="mb-4 text-gray-700">
          あなたの所持PW：<span className="font-bold">{numericUserPw}</span>
        </p>

        {/* ボタン */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-400 text-white font-bold hover:bg-gray-500"
          >
            キャンセル
          </button>
          <button
            onClick={() => onConfirm(selected)}
            className="px-4 py-2 rounded bg-red-500 text-white font-bold hover:bg-red-600"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
};

export default PwUseModal;
