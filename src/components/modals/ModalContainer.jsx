// ------------------------------------------------------
// 🪄 ModalContainer.jsx（v1.0 / 共通アニメ＋背景統一）
// ------------------------------------------------------
import React from "react";
import { motion } from "framer-motion";
import { modalGradients } from "@/lib/modalGradients";

/**
 * 共通モーダルコンテナ
 * @param {string} type - "rankup" | "reward" | "save"
 * @param {React.ReactNode} children - モーダル内部要素
 */
export default function ModalContainer({ type = "rankup", children }) {
  const gradient = modalGradients[type] || modalGradients.rankup;

  return (
    <motion.div
      className="relative rounded-3xl shadow-2xl p-8 w-[90%] max-w-md text-center overflow-hidden"
      style={{ background: gradient }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120 }}
    >
      {/* 光やグラデーションの動き層 */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-40"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          background: gradient,
          backgroundSize: "400% 400%",
          filter: "blur(25px)",
        }}
      />

      {/* 内部コンテンツ */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
