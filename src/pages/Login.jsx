import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestoreからユーザーデータを取得
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // ロールに応じて遷移
      if (userData.role === "parent") {
        navigate("/parent-home");
      } else if (userData.role === "child") {
        navigate("/child-home");
      } else if (userData.role === "admin") {
        navigate("/admin-reward"); // ← 管理者専用ページへ
      } else {
        setError("ユーザーの種類が不明です");
      }
    } catch (err) {
      setError("ログインに失敗しました: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6">🔐 ログイン</h1>

      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}

export default Login;
