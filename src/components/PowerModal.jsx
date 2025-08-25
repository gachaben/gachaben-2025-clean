import React, { useState, useEffect } from 'react';

const PwUseModal = ({ item, userPw, onClose, onConfirm, onAmountChange }) => {
  const [selected, setSelected] = useState(100);
  const [isOverLimit, setIsOverLimit] = useState(false);

  const options = [100, 200, 300, 400, 500];

  useEffect(() => {
    console.log("驕ｸ謚・", selected, "/ 謇謖・", userPw, "/ 雜・℃?:", selected > userPw);
    setIsOverLimit(selected > userPw);
  }, [selected, userPw]);

  const handleSelect = (amount) => {
    setSelected(amount);
    if (onAmountChange) onAmountChange(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {/* 圻 繝・せ繝郁｡ｨ遉ｺ・壼ｷｦ荳雁崋螳・*/}
      {isOverLimit && (
        <div className="fixed top-4 left-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-2xl">
          圻 繧ｪ繝ｼ繝舌・繝ｪ繝溘ャ繝育憾諷具ｼ・
        </div>
      )}

      {/* 笨・relative 蠢・・*/}
      <div className="relative bg-white rounded-lg p-6 shadow-xl w-80 text-center">
        {/* 圻 繝｢繝ｼ繝繝ｫ蜀・ｸｭ螟ｮ驥阪・陦ｨ遉ｺ */}
        {isOverLimit && (
          <div className="absolute inset-0 bg-white/70 z-[9999] flex items-center justify-center pointer-events-none">
            <div className="text-6xl text-red-600 animate-pulse">圻</div>
          </div>
        )}

        <h2 className="text-xl font-bold mb-2">PW繧剃ｽｿ縺・/h2>
        <p className="mb-4 text-gray-700">
          縺ゅ↑縺溘・謇謖￣W・・span className="font-bold text-blue-600">{userPw}</span>
        </p>

        {/* 繝懊ち繝ｳ鄒､ */}
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

        {/* 豎ｺ螳壹・繧ｿ繝ｳ */}
        <button
          className={`w-full px-4 py-2 rounded font-bold text-white ${
            isOverLimit ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
          onClick={() => !isOverLimit && onConfirm(selected)}
          disabled={isOverLimit}
        >
          豎ｺ螳夲ｼ・selected} PW菴ｿ縺・ｼ・
        </button>
      </div>
    </div>
  );
};

export default PwUseModal;
