// src/components/DevWriteButton.jsx
import React from "react";
import { getFirebaseAuth, getFirestoreDb } from "@/fbkit";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function DevWriteButton() {
  const handle = async () => {
    const auth = getFirebaseAuth();
    const db = getFirestoreDb();
    const u = auth.currentUser;
    if (!u) { alert("まずログインしてください"); return; }
    await setDoc(doc(db, "users", u.uid), {
      email: u.email ?? null,
      role: "child",
      createdAt: serverTimestamp(),
      _dev: true,
    }, { merge: true });
    alert("users/{uid} を作成/更新しました");
  };

  return (
    <button onClick={handle}
      style={{marginTop:12, padding:"6px 10px", border:"1px solid #999", borderRadius:6}}>
      Dev: users/{'{uid}'} を作る
    </button>
  );
}
