// ------------------------------------------------------
// 🎫 useTickets.js（v1.7-dev デバッグモード対応版）
// バトル券の取得・消費・付与ユーティリティ
// Firestore: users/{uid}/tickets
// ------------------------------------------------------

import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/fbkit";
import { getAuth } from "firebase/auth";

// 🔧 デバッグモード：true ならバトル券チェックをスキップ
const DEBUG_MODE = true;

// 🎫 現在のバトル券枚数を取得
export async function getTickets(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return data.tickets ?? 0;
    }
    return 0;
  } catch (e) {
    console.error("❌ getTickets失敗:", e);
    return 0;
  }
}

// 🎫 バトル券を1枚消費（入場時）
export async function consumeTicket() {
  try {
    // 🧩 デバッグモードでスキップ
    if (DEBUG_MODE) {
      console.log("🧩 DEBUG_MODE: バトル券チェックをスキップ（常にOK）");
      return true;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return false;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("⚠️ ユーザー情報なし。新規作成します。");
      await setDoc(ref, { tickets: 0 }, { merge: true });
      return false;
    }

    const current = snap.data().tickets ?? 0;
    if (current <= 0) {
      console.warn("🎫 バトル券がありません。");
      return false;
    }

    await updateDoc(ref, { tickets: current - 1 });
    console.log(`✅ バトル券消費: ${current} → ${current - 1}`);
    return true;
  } catch (e) {
    console.error("❌ consumeTicket失敗:", e);
    return false;
  }
}

// 🎫 バトル券を付与（報酬・参加賞）
export async function grantTickets(uid, add = 1) {
  try {
    if (!uid || add <= 0) return false;

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    let current = 0;

    if (snap.exists()) {
      current = snap.data().tickets ?? 0;
    }

    const newVal = Math.min(current + add, 5); // 上限5枚
    await setDoc(ref, { tickets: newVal }, { merge: true });

    console.log(`🎁 バトル券付与: ${current} → ${newVal}`);
    return true;
  } catch (e) {
    console.error("❌ grantTickets失敗:", e);
    return false;
  }
}
