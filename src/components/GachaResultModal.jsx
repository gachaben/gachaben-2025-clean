// src/components/GachaResultModal.jsx
import React from "react";

const GachaResultModal = ({ point, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">🎰 ガチャ結果！</h2>
        <p className="text-6xl font-extrabold text-green-600 drop-shadow-lg mb-4">
          +{point} pt
        </p>
        <button
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default GachaResultModal;
