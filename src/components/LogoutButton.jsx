// components/LogoutButton.jsx
import React from "react";
import { getAuth, signOut } from "firebase/auth";

const LogoutButton = () => {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("ログアウトしました！");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return <button onClick={handleLogout}>ログアウト</button>;
};

export default LogoutButton;
