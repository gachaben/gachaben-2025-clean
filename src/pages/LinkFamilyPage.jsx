// src/pages/LinkFamilyPage.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function LinkFamilyPage() {
  const [code, setCode] = useState("");
  const [uid, setUid] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null));
    return () => unsub();
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setError("");
    if (!uid) return setError("ログイン状態を確認できません。");

    try {
      const familyCode = code.trim().toUpperCase();
      const famRef = doc(db, "families", familyCode);
      const famSnap = await getDoc(famRef);
      if (!famSnap.exists()) return setError("ファミリーコードが見つかりません。");

      const parentId = famSnap.data().parentId;

      await updateDoc(doc(db, "users", uid), { parentId, familyCode });
      await setDoc(doc(db, "families", familyCode, "children", uid), {
        linkedAt: new Date().toISOString(),
      });

      navigate("/child-home");
    } catch (e) {
      setError("ひもづけに失敗しました: " + e.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 px-4">
      <h1 className="text-2xl font-bold mb-4">👨‍👩‍👧 ファミリーコードを入力</h1>
      <form onSubmit={handleLink} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          placeholder="例: ABC123"
          maxLength={8}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-600">
          ひもづける
        </button>
      </form>
    </div>
  );
}
