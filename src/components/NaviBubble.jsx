import React from "react";

export default function NaviBubble({ message, subMessage }) {
  return (
    <div
      style={{
        position: "fixed",              // ← 固定位置に変更！
        top: "5vh",                     // ← 画面上から少し下
        left: "50%",                    // ← 中央寄せ
        transform: "translateX(-50%)",  // ← 完全中央補正
        background: "#fff",
        color: "#333",
        borderRadius: "16px",
        padding: "10px 18px",
        border: "3px solid red",        // ← デバッグ枠（あとで消せる）
        zIndex: 2147483647,             // ← モーダルより上
        pointerEvents: "none",          // ← クリックを妨げない
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <div className="text-lg font-bold">{message}</div>
      {subMessage && (
        <div className="text-sm text-gray-600">{subMessage}</div>
      )}
    </div>
  );
}
