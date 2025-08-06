import React, { useState, useEffect } from 'react';

const PwUseModal = ({ item, userPw, onClose, onConfirm, onAmountChange }) => {
  const [selected, setSelected] = useState(100);
  const [isOverLimit, setIsOverLimit] = useState(false);

  const options = [100, 200, 300, 400, 500];

  useEffect(() => {
    console.log("選択:", selected, "/ 所持:", userPw, "/ 超過?:", selected > userPw);
    setIsOverLimit(selected > userPw);
  }, [selected, userPw]);

  const handleSelect = (amount) => {
    setSelected(amount);
    if (onAmountChange) onAmountChange(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* 🚫 テスト表示：左上固定 */}
      {isOverLimit && (
        <div className="fixed top-4 left-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-2xl">
          🚫 オーバーリミット状態！
        </div>
      )}

      {/* ✅ relative 必須 */}
      <div className="relative bg-white rounded-lg p-6 shadow-xl w-80 text-center">
        {/* 🚫 モーダル内中央重ね表示 */}
        {isOverLimit && (
          <div className="absolute inset-0 bg-white/70 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="text-6xl text-red-600 animate-pulse">🚫</div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-2">PWを使う</h2>
        <p className="mb-4 text-gray-700">
          あなたの所持PW：<span className="font-bold text-blue-600">{userPw}</span>
        </p>

        {/* ボタン群 */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {options.map((amount) => (
            <button
              key={amount}
              onClick={() => handleSelect(amount)}
              className={`px-4 py-2 rounded-full font-bold border ${
                selected === amount
                  ? 'bg-blue-500 text-white'
                  : userPw < amount
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {amount} PW
            </button>
          ))}
        </div>

        {/* 決定ボタン */}
        <button
          className={`w-full px-4 py-2 rounded font-bold text-white ${
            isOverLimit ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={() => !isOverLimit && onConfirm(selected)}
          disabled={isOverLimit}
        >
          決定（{selected} PW使う）
        </button>
      </div>
    </div>
  );
};

export default PwUseModal;
