// components/LogoutButton.jsx
import React from "react";
import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/fbkit"; // ← プロジェクトに合わせてパス調整

const LogoutButton = () => {
  const handleLogout = async () => {
    const auth = getFirebaseAuth();
    try {
      await signOut(auth);
      alert("ログアウトしました");
    } catch (error) {
      console.error("ログアウトエラー:", error);
      alert("ログアウトに失敗しました");
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
};

export default LogoutButton;
