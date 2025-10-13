// ------------------------------------------------------
// 💖 HeartsContext.jsx（v3.1 認証完了後購読＋安全ガード）
// ------------------------------------------------------
import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, increment, setDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/fbkit";

const HeartsContext = createContext();

export function HeartsProvider({ children }) {
  const [hearts, setHearts] = useState(null); // null = 未ロード
  const [uid, setUid] = useState(null);
  const auth = getAuth();

  // ✅ 認証状態の監視
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("👤 Auth ready:", user.uid);
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsubAuth();
  }, []);

  // ✅ Firestore購読（uidが確定してから開始）
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "users", uid);

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.hearts === "number") {
          setHearts(data.hearts);
          console.log("💖 Firestore hearts更新:", data.hearts);
        } else {
          // heartsが存在しない場合は初期化
          setDoc(ref, { hearts: 5 }, { merge: true });
          setHearts(5);
        }
      } else {
        // ドキュメントが無ければ作成
        setDoc(ref, { hearts: 5 }, { merge: true });
        setHearts(5);
      }
    });

    return () => unsub();
  }, [uid]);

  // ❤️ ハート消費
  const consumeHeart = async () => {
    if (!uid || hearts === null) return false;
    const ref = doc(db, "users", uid);

    if (hearts <= 0) {
      console.warn("💔 ハートが足りません");
      return false;
    }

    try {
      await updateDoc(ref, { hearts: increment(-1) });
      console.log("❤️ ハートを1つ消費");
      return true;
    } catch (e) {
      console.error("❌ consumeHeart失敗:", e);
      return false;
    }
  };

  // 💖 広告視聴で全回復
  const recoverHearts = async (value = 5) => {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    try {
      await updateDoc(ref, { hearts: value });
      console.log("💖 ハート全回復:", value);
    } catch (e) {
      console.error("❌ recoverHearts失敗:", e);
    }
  };

  return (
    <HeartsContext.Provider value={{ hearts, consumeHeart, recoverHearts }}>
      {children}
    </HeartsContext.Provider>
  );
}

export const useHearts = () => useContext(HeartsContext);
