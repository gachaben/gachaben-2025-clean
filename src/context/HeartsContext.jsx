// src/context/HeartsContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { ensureUserDoc, consumeHeart as consumeHeartApi, recoverHearts as recoverHeartsApi } from "@/lib/heartUtils";

const HeartsContext = createContext(null);

export function HeartsProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [hearts, setHearts] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUid(null);
        setHearts(5);
        setLoading(false);
        return;
      }
      setUid(user.uid);
      await ensureUserDoc();

      // リアルタイムに hearts を購読
      const ref = doc(db, "users", user.uid);
      const off = onSnapshot(ref, (snap) => {
        const data = snap.data();
        setHearts(data?.hearts ?? 5);
        setLoading(false);
      });
      return () => off();
    });
    return () => unsub();
  }, []);

  const consumeHeart = async () => {
    const ok = await consumeHeartApi();
    // onSnapshot が state を更新してくれるのでここでは何もしない
    return ok;
  };

  const recoverHearts = async () => {
    await recoverHeartsApi();
    return true;
  };

  return (
    <HeartsContext.Provider value={{ uid, hearts, loading, consumeHeart, recoverHearts }}>
      {children}
    </HeartsContext.Provider>
  );
}

export function useHearts() {
  const ctx = useContext(HeartsContext);
  if (!ctx) throw new Error("useHearts must be used within HeartsProvider");
  return ctx;
}
