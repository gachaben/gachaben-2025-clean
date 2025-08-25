import { useState } from "react";
import { auth, db } from "@/fbkit";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [parentEmail, setParentEmail] = useState(""); // 蛤霑ｽ蜉・・

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 反 Firestore縺ｫ菫晏ｭ・
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName,
        email,
        parentEmail, // 蛤縺薙％縺ｫ菫晁ｭｷ閠・・繝｡繝ｼ繝ｫ繧ゆｿ晏ｭ假ｼ・
        createdAt: new Date(),
      });

      alert("逋ｻ骭ｲ縺悟ｮ御ｺ・＠縺ｾ縺励◆・・);
    } catch (error) {
      console.error("逋ｻ骭ｲ繧ｨ繝ｩ繝ｼ:", error);
      alert("逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
    }
  };

  return (
    <div>
      <h2>繝ｦ繝ｼ繧ｶ繝ｼ逋ｻ骭ｲ</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="繝九ャ繧ｯ繝阪・繝"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="繝代せ繝ｯ繝ｼ繝・
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="菫晁ｭｷ閠・・繝｡繝ｼ繝ｫ繧｢繝峨Ξ繧ｹ・井ｻｻ諢擾ｼ・
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />
        <button type="submit">逋ｻ骭ｲ</button>
      </form>
    </div>
  );
};

export default RegisterPage;
