// src/components/PowerSelectModal.jsx
import React from "react";

const PowerSelectModal = ({ items, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">縺ｩ縺ｮ繧｢繧､繝・Β縺ｫ繝代Ρ繝ｼ繧偵◎縺昴＄・・/h2>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <li key={item.itemId} className="flex justify-between items-center border p-2 rounded">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">迴ｾ蝨ｨ繝代Ρ繝ｼ・嘴item.pw}</p>
              </div>
              <button
                className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded"
                onClick={() => onSelect(item)}
              >
                縺薙・繧｢繧､繝・Β縺ｫ
              </button>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 text-blue-600 underline"
          onClick={onClose}
        >
          縺ｨ縺倥ｋ
        </button>
      </div>
    </div>
  );
};

export default PowerSelectModal;
