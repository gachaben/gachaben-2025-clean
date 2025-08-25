// components/LogoutButton.jsx
import React from "react";
import { getAuth, signOut } from "firebase/auth";

const LogoutButton = () => {
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      alert("ログアウトしました�E�E);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return <button onClick={handleLogout}>ログアウチE/button>;
};

export default LogoutButton;
