import React, { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "../fbkit/index.js";

export default function LoginPage() {
  const db = getFirestoreDb();
  const [msg, setMsg] = useState("");

  async function seedUsers() {
    try {
      const id = `seed_${Date.now()}`;
      await setDoc(doc(db, "users", id), {
        displayName: "seed user",
        createdAt: serverTimestamp(),
      });
      setMsg("✅ users に seed を書き込みました。");
    } catch (e) {
      console.error(e);
      setMsg(`⚠️ 失敗: ${e.message}`);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Login Test Page</h1>
        <p className="text-neutral-600 text-sm text-center">
          Firestore への seed 書き込みを確認するためのテストページです。
        </p>
        <button
          onClick={seedUsers}
          className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition"
        >
          users に seed を書き込む
        </button>
        <div className="text-center text-sm text-neutral-800">{msg || "…"}</div>
      </div>
    </div>
  );
}
