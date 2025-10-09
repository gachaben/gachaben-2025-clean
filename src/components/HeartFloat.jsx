// src/components/HeartFloat.jsx
import ReactDOM from "react-dom";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeartFloat({ show }) {
  const el = (
    <AnimatePresence>
      {show && (
        <motion.div
          key="heart-float"
          initial={{ opacity: 0, y: 80, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [80, -10, -60, -120],
            scale: [0.8, 1.3, 1.1, 0.9],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1],
          }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 text-pink-500 text-7xl font-bold pointer-events-none select-none drop-shadow-[0_0_10px_rgba(255,192,203,0.6)] z-[9999]"
        >
          💖＋5
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(el, document.body);
}
