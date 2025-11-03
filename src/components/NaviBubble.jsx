// ------------------------------------------------------
// 🎵 NaviBubble.jsx（ドレミノ吹き出し）
// ------------------------------------------------------
import React from "react";

export default function NaviBubble({ message, subMessage }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative inline-block">
        <div className="bg-white border-2 border-pink-300 text-gray-800 rounded-2xl px-4 py-3 shadow-md text-sm">
          <div className="font-bold text-pink-600 mb-1">{message}</div>
          {subMessage && <div className="text-gray-600">{subMessage}</div>}
        </div>
        {/* 三角部分 */}
        <div className="absolute left-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-pink-300 transform -translate-x-1/2"></div>
      </div>
      {/* ドレミノアイコン（仮） */}
      <div className="mt-2 text-2xl">🎵</div>
    </div>
  );
}
