import React from "react";

export default function ItemCard({ item, owned = true, className = "" }) {
  if (!item) return null;

  const { name = "？", rank = "-", pw = 0, imageName } = item;
  // 画像パス（なければフォールバック）
  const src = imageName ? `/images/items/${imageName}.png` : null;

  return (
    <div
      className={`relative w-44 h-64 rounded-2xl overflow-hidden shadow-sm border bg-gradient-to-br from-amber-200 to-amber-400 ${className}`}
      aria-label={`${name}（${rank}）`}
    >
      {/* 背景画像 */}
      {src ? (
        <img
          src={src}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // 画像が無いときのフォールバック
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}

      {/* うっすら暗幕で文字が読みやすい */}
      <div className="absolute inset-0 bg-black/10" />

      {/* ラベル群 */}
      <div className="absolute top-2 left-2 right-2">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/80 text-gray-800">
            {owned ? "所持" : "？"}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-400/90 text-gray-900">
            {rank}
          </span>
        </div>
        <div className="mt-1 text-white font-bold drop-shadow text-sm truncate">{name}</div>
      </div>

      {/* 下部ステータス */}
      <div className="absolute left-2 right-2 bottom-2">
        <div className="px-2 py-1 rounded-md bg-white/85 text-gray-800 text-xs font-semibold flex items-center justify-between">
          <span>PW</span>
          <span className="tabular-nums">{pw}</span>
        </div>
      </div>
    </div>
  );
}
