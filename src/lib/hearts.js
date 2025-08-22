// src/lib/hearts.js
import { runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase";
import { userDocRef } from "./userState";

/**
 * ❤を1消費する。残量0なら NO_HEART を投げる（idempotencyKeyで二重防止）
 */
export async function consumeOneHeart(uid, idempotencyKey) {
  if (!uid) throw new Error("NO_AUTH");
  const ref = userDocRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("USER_MISSING");
    const u = snap.data() || {};

    // 二重実行防止（直前と同じキーならスルー）
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
}

/** （将来用）広告視聴などで全回復 */
export async function fullRecoverHearts(uid) {
  if (!uid) throw new Error("NO_AUTH");
  const ref = userDocRef(uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    tx.update(ref, { hearts: 5, heartsLastTickAt: serverTimestamp() });
  });
}
