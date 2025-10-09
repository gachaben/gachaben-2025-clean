// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css"; // ← Tailwind 読み込み

// ★ Firebase エミュ接続（超重要）
import { getFirebaseAuth, getFirestoreDb, getFirebaseStorage } from "@/fbkit";
getFirebaseAuth();     // これが先に走れば identitytoolkit へ行かない
getFirestoreDb();
getFirebaseStorage();

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
