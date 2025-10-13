// ------------------------------------------------------
// 🚀 src/index.jsx（React Router + Firebase App起動点）
// ------------------------------------------------------
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// ✅ React 18 用レンダー構文
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* React Router 有効化 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
