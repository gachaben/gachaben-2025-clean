// ------------------------------------------------------
// 🎵 src/components/ui/NoteBurst.jsx
// 正解時の音符アニメーション（Lvごとに飛ばす）
// ------------------------------------------------------
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NoteBurst({ count = 1, color = "#fb7185" }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {[...Array(count)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 20,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              y: -120 - Math.random() * 80,
              x: Math.random() * 120 - 60,
              opacity: [0, 1, 0],
              scale: [0.8, 1.4, 0.6],
            }}
            transition={{
              duration: 1.8 + Math.random() * 0.5,
              ease: "easeOut",
              delay: i * 0.1,
            }}
            className="absolute text-3xl"
            style={{
              left: "50%",
              bottom: "40%",
              color,
            }}
          >
            ♬
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
