// ------------------------------------------------------
// 🚀 src/main.jsx
// Reactアプリのエントリーポイント
// ------------------------------------------------------
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css"; // Tailwind 読み込み

// Firebase 初期化（上のfirebase.jsが自動的に接続する）
import "./firebase";

// ------------------------------------------------------
// 🚫 Firebase Emulator 警告バーを強制非表示
// ------------------------------------------------------
const hideEmuBar = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    .firebase-emulator-warning {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      position: absolute !important;
    }
  `;
  document.head.appendChild(style);
};
hideEmuBar();

// 💖 RewardFx（全画面アニメ）をアプリ全体に適用
import { RewardFxProvider } from "@/context/RewardFxContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <RewardFxProvider>
        <App />
      </RewardFxProvider>
    </BrowserRouter>
  </React.StrictMode>
);
