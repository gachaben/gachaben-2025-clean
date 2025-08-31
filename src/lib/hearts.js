import { runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";   // ← 追加
import { userDocRef } from "./userState";

const db = getFirestoreDb();               // ← 追加

// ❤を1つ消費
export async function consumeOneHeart(uid, idempotencyKey) {
  if (!uid) throw new Error("NO_AUTH");
  const ref = userDocRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("USER_MISSING");

    const u = snap.data() || {};
    if (u.lastConsumeKey === idempotencyKey) return; // 二重防止

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

// ❤を満タンに回復
export async function fullRecoverHearts(uid, { reason } = {}) {
  if (!uid) throw new Error("NO_AUTH");
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
}
