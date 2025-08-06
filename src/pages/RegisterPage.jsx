import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [parentEmail, setParentEmail] = useState(""); // 🔸追加！

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔽 Firestoreに保存
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        parentEmail, // 🔸ここに保護者のメールも保存！
        createdAt: new Date(),
      });

      alert("登録が完了しました！");
    } catch (error) {
      console.error("登録エラー:", error);
      alert("登録に失敗しました");
    }
  };

  return (
    <div>
      <h2>ユーザー登録</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="ニックネーム"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="保護者のメールアドレス（任意）"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />
        <button type="submit">登録</button>
      </form>
    </div>
  );
};

export default RegisterPage;
