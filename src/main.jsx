import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";            // ↁEこれが趁E��要E��Eailwindを読み込む�E�E

// ★ 起動直後にエミュへ接続（超重要）
import { getFirebaseAuth, getFirestoreDb, getFirebaseStorage } from "@/fbkit";
getFirebaseAuth();     // これが先に走れば identitytoolkit へ行かない
getFirestoreDb();
getFirebaseStorage();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
