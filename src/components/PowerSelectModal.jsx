// src/components/PowerSelectModal.jsx
import React from "react";

const PowerSelectModal = ({ items, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">どのアイテムにパワーをそそぐ？</h2>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <li key={item.itemId} className="flex justify-between items-center border p-2 rounded">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">現在パワー：{item.pw}</p>
              </div>
              <button
                className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded"
                onClick={() => onSelect(item)}
              >
                このアイテムに
              </button>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 text-blue-600 underline"
          onClick={onClose}
        >
          とじる
        </button>
      </div>
    </div>
  );
};

export default PowerSelectModal;
