// src/components/RequireAdmin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirestoreDb } from "@/firebase";

const auth = getFirebaseAuth();
const db = getFirestoreDb();

export default function RequireAdmin({ children }) {
  const nav = useNavigate();
  const [state, setState] = useState({ checking: true, allowed: false, error: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setState({ checking: false, allowed: false, error: null });
        nav("/login", { replace: true });
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const role = snap.exists() ? snap.data()?.role : "user";
        if (role === "banned") {
          nav("/banned", { replace: true });
          return;
        }
        setState({ checking: false, allowed: role === "admin", error: null });
      } catch (e) {
        setState({ checking: false, allowed: false, error: e });
      }
    });
    return () => unsub();
  }, [nav]);

  if (state.checking) {
    return <div className="p-6 text-sm text-neutral-600">確認中…</div>;
  }
  if (state.error) {
    return <div className="p-6 text-sm text-red-600">権限確認に失敗しました。</div>;
  }
  if (!state.allowed) {
    return (
      <div className="p-6 space-y-2">
        <div className="text-sm text-red-600">権限がありません（admin 専用ページ）</div>
      </div>
    );
  }
  return <>{children}</>;
}
