// ------------------------------------------------------
// 🪄 ThemeContext.jsx（テーマ管理）
// ------------------------------------------------------
import React, { createContext, useContext, useState, useEffect } from "react";
import { themes } from "@/themeConfig";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 現在のテーマ
  const [themeName, setThemeName] = useState("default");
  const [theme, setTheme] = useState(themes.default);

  // テーマ変更
  const changeTheme = (name) => {
    const next = themes[name] || themes.default;
    setThemeName(name);
    setTheme(next);
  };

  // 🌙 月ごと自動テーマ切り替え
  useEffect(() => {
    const month = new Date().getMonth() + 1;
    if (month === 12) changeTheme("christmas");
    else if (month === 10) changeTheme("halloween");
    else if (month >= 3 && month <= 5) changeTheme("spring");
    else if (month >= 6 && month <= 8) changeTheme("summer");
    else changeTheme("default");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
