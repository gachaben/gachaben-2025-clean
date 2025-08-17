// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",                // ← これを忘れると一部クラス効かないことがある
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    "z-[9999]", // ダイアログ・モーダル用の z-index 保護
  ],
  theme: {
    extend: {
      keyframes: {
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 8px rgba(255, 223, 0, 0.6)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(255, 223, 0, 1)",
          },
        },
        glowA: {
          "0%, 100%": {
            boxShadow: "0 0 6px rgba(255, 128, 0, 0.4)",
          },
          "50%": {
            boxShadow: "0 0 15px rgba(255, 64, 0, 0.6)",
          },
        },
        glowB: {
          "0%, 100%": {
            boxShadow: "0 0 4px rgba(144, 238, 144, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 8px rgba(144, 238, 144, 0.3)",
          },
        },
        fadeUp: { // ★ Battle用数値浮遊エフェクト
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "10%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-16px) scale(1.02)" },
        },
      },
      animation: {
        glow: "glow 1.5s ease-in-out infinite",
        glowA: "glowA 1.5s ease-in-out infinite",
        glowB: "glowB 1.5s ease-in-out infinite",
        fadeUp: "fadeUp 0.8s ease-out both", // ★ 追加
      },
      boxShadow: {
        glow: "0 0 8px rgba(255, 223, 0, 0.6), 0 0 25px rgba(255, 223, 0, 1)",       // Sランク用
        glowA: "0 0 6px rgba(255, 128, 0, 0.4), 0 0 15px rgba(255, 64, 0, 0.6)",     // Aランク用
        glowB: "0 0 4px rgba(144, 238, 144, 0.2), 0 0 8px rgba(144, 238, 144, 0.3)", // Bランク用
      },
    },
  },
  plugins: [],
};
