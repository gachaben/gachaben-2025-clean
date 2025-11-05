// ------------------------------------------------------
// 💬 DoreminoBubble.jsx（v2.0 / 表情別キャラ画像対応）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";

export default function DoreminoBubble({ type = "normal", message }) {
  let imgSrc = "";
  let bubbleColor = "";

  switch (type) {
    case "perfect":
      imgSrc = "/images/doremino/doremi_perfect.png";
      bubbleColor = "bg-gradient-to-r from-yellow-100 to-pink-100";
      break;
    case "good":
      imgSrc = "/images/doremino/doremi_good.png";
      bubbleColor = "bg-gradient-to-r from-blue-100 to-purple-100";
      break;
    case "arere":
      imgSrc = "/images/doremino/doremi_arere.png";
      bubbleColor = "bg-gradient-to-r from-gray-100 to-blue-50";
      break;
    default:
      imgSrc = "/images/doremino/doremi_good.png";
      bubbleColor = "bg-white";
  }

  return (
    <motion.div
      className="flex flex-col items-center mt-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-3">
        {/* キャラ画像 */}
        <img
          src={imgSrc}
          alt="ドレミノ"
          className="w-14 h-14 object-contain drop-shadow-md"
        />

        {/* 吹き出し */}
        <div
          className={`rounded-2xl px-4 py-2 text-gray-800 text-center text-sm shadow ${bubbleColor}`}
        >
          {message}
        </div>
      </div>
    </motion.div>
  );
}
