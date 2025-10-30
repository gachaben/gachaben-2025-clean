// ------------------------------------------------------
// src/contexts/ThemeContext.jsx
// ------------------------------------------------------
import React, { createContext, useContext, useMemo } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 🎯 .envで指定したイベントテーマを取得
  const eventTheme = import.meta.env.VITE_EVENT_THEME || "normal";

  // 🎨 テーマ定義（イベント別）
  const themeConfig = {
    normal: {
      background: "linear-gradient(to bottom, #fffbea, #ffe5ec)",
      accent: "#ff80ab",
      textColor: "#333",
    },
    christmas: {
      background: "linear-gradient(to bottom, #004400, #a00000)",
      accent: "#00ff88",
      textColor: "#fff",
    },
    summer: {
      background: "linear-gradient(to bottom, #00c6ff, #fff8b0)",
      accent: "#ffb300",
      textColor: "#004",
    },
    halloween: {
      background: "linear-gradient(to bottom, #2c003e, #ff8c00)",
      accent: "#ffcc00",
      textColor: "#fff7e6",
    },
    rainbow: {
      background:
        "linear-gradient(135deg, red, orange, yellow, green, cyan, blue, violet)",
      accent: "#fff",
      textColor: "#222",
    },
  };

  // ⚙️ 現在のテーマを選択
  const theme = useMemo(() => themeConfig[eventTheme] || themeConfig.normal, [eventTheme]);

  return (
    <ThemeContext.Provider value={{ theme, eventTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
