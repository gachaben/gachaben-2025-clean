// src/components/AdHeartModal.jsx
import React from "react";

export default function AdHeartModal({ open, onWatch, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-md text-center">
        <div className="text-2xl mb-2">💔 ハートが足りません</div>
        <p className="text-gray-600 mb-5">広告を見るとハートが全回復（5）します。</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onWatch}
            className="px-5 py-3 rounded-lg font-bold bg-yellow-300 hover:bg-yellow-400 shadow"
          >
            🎬 広告を見て回復
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
