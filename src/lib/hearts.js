// src/lib/hearts.js
import { runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";
import { userDocRef } from "./userState";

/**
 * ❤ 1つ消費
 * idempotencyKey（二重送信防止キー）を持つ安全な消費処理
 */
export async function consumeOneHeart(uid, idempotencyKey) {
  if (!uid) throw new Error("NO_AUTH");
  const db = getFirestoreDb();
  const ref = userDocRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("USER_MISSING");
    const u = snap.data() || {};

    // 二重送信チェック
    if (u.lastConsumeKey === idempotencyKey) return;

    const hearts = u.hearts ?? 0;
    if (hearts <= 0) {
      const err = new Error("NO_HEART");
      err.code = "NO_HEART";
      throw err;
    }

    tx.update(ref, {
      hearts: hearts - 1,
      heartsLastTickAt: serverTimestamp(),
      lastConsumeKey: idempotencyKey,
    });
  });

  console.log(`❤️ consumeOneHeart: -1 (uid=${uid})`);
}

/**
 * ❤ 全回復
 * 広告・時間回復・デバッグなどから呼び出す。
 */
export async function fullRecoverHearts(uid, { reason = "manual" } = {}) {
  if (!uid) throw new Error("NO_AUTH");
  const db = getFirestoreDb();
  const ref = userDocRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;

    const update = {
      hearts: 5,
      heartsLastTickAt: serverTimestamp(),
    };
    if (reason === "ad") {
      update.lastAdHeartsAt = serverTimestamp();
    }

    tx.update(ref, update);
  });

  console.log(`💖 fullRecoverHearts: 完了 (${reason})`);
}
