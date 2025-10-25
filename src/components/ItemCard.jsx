// ------------------------------------------------------
// 🎴 ItemCard.jsx（v4.0 図鑑用・バトル要素削除＋プレミアム対応）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import { itemNames } from "../data/itemNames.js";

export default function ItemCard({ item, owned = false }) {
  if (!item) return null;

  const {
    imageName = "",
    name = "",
    rank = "",
    seriesId = "2508",
    stage = 1,
  } = item;

  // ===== 🔍 画像パス =====
  const base = String(imageName).replace(/\.png$/i, "");
  const fileBase = base.replace(/^\d{4}_/, "");
  const imagePath = `/images/${seriesId}/stage${stage}/${fileBase}.png`;

  // ===== 🏅 ランク別設定 =====
  const isS = rank === "S";
  const isA = rank === "A";
  const isB = rank === "B";
  const isPremium = rank === "PREMIUM";

  // ===== 🎨 色設定 =====
  const borderColor = isPremium
    ? "#facc15"
    : isS
    ? "#fde047"
    : isA
    ? "#f87171"
    : isB
    ? "#60a5fa"
    : "#d1d5db";

  const effectVideo = isPremium
    ? null
    : isS
    ? "S_spark.mp4"
    : isA
    ? "A_spark.mp4"
    : isB
    ? "B_spark.mp4"
    : null;

  // ===== 📛 名前解決 =====
  const resolvedName =
    (name && name.trim()) || itemNames[base] || base || "？？？";

  // 長い名前の2行化
  const nameLines = (() => {
    if (resolvedName.length > 8) {
      const mid = Math.ceil(resolvedName.length / 2);
      return [resolvedName.slice(0, mid), resolvedName.slice(mid)];
    }
    return [resolvedName];
  })();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative w-36 h-48 rounded-xl overflow-hidden shadow-md ${
        owned ? "" : "opacity-50 grayscale"
      }`}
      style={{
        background: "transparent",
        border: `3px solid ${borderColor}`,
        boxShadow: `0 0 12px ${borderColor}40`,
      }}
    >
      {/* 🔆 背景動画（S/A/Bランク用） */}
      {effectVideo && (
        <video
          src={`/images/effects/${effectVideo}`}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            mixBlendMode: "plus-lighter",
            zIndex: 0,
          }}
        />
      )}

      {/* ✨ プレミアム専用光反射 */}
      {isPremium && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shine" />
        </div>
      )}

      {/* 🖼️ 画像 */}
      <img
        src={imagePath}
        alt={resolvedName}
        draggable={false}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[90%] max-h-[70%] object-contain z-10"
      />

      {/* 📛 名前 */}
      <div className="absolute top-2 w-full text-center text-[12px] font-bold text-white drop-shadow-[0_0_4px_black]">
        {nameLines.join("\n")}
      </div>

      {/* 🏷️ ランク表示 */}
      <div
        className="absolute top-1 right-2 text-lg font-extrabold"
        style={{
          color: borderColor,
          textShadow: "0 0 4px #000, 0 0 8px #000",
        }}
      >
        {rank}
      </div>

      {/* 🌟 プレミアムラベル */}
      {isPremium && (
        <div className="absolute top-1 left-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
          ✨PREMIUM
        </div>
      )}

      {/* 🔒 未所持マスク */}
      {!owned && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center text-white text-xs">
          未入手
        </div>
      )}

      {/* ✨ 光アニメーション */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); opacity: 0; }
          40% { opacity: 0.7; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        .animate-shine {
          animation: shine 3.5s linear infinite;
          mix-blend-mode: overlay;
        }
      `}</style>
    </motion.div>
  );
}
