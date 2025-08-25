import React, { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // 起動時に匿名サインイン（未ログインだと 400/500 の温床になるため先に実行）
    signInAnonymously(auth).then(() => setMsg("匿名ログインOK")).catch(e => setMsg(String(e)));
  }, []);

  async function seed() {
    const uid = auth.currentUser?.uid ?? "EMU_TEST_UID";
    await setDoc(doc(db, "users", uid), {
      displayName: "Demo User",
      hearts: 5,
      battleTickets: 3,
      createdAt: serverTimestamp(),
    }, { merge: true });
    setMsg(`seeded: users/${uid}`);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Login (minimal)</h1>
      <p>{msg || "..."}</p>
      <button onClick={seed}>users に書き込む（seed）</button>
    </div>
  );
}
