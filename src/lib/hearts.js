// src/lib/hearts.js
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/fbkit";

export const MAX_HEARTS = 5;

/** 広告視聴などで ❤ を満タンにする */
export async function fullRecoverHearts(uid, { reason = "ad" } = {}) {
  if (!uid) throw new Error("uid is required");
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      tx.set(
        ref,
        {
          hearts: MAX_HEARTS,
          lastAdHeartsAt: serverTimestamp(),
          lastAdHeartsReason: reason,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return;
    }

    tx.update(ref, {
      hearts: MAX_HEARTS,
      lastAdHeartsAt: serverTimestamp(),
      lastAdHeartsReason: reason,
      updatedAt: serverTimestamp(),
    });
  });
}

/** n個消費（0未満にならない） */
export async function spendHearts(uid, n = 1) {
  if (!uid) throw new Error("uid is required");
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cur = (snap.data()?.hearts ?? 0) | 0;
    const next = Math.max(0, cur - Math.max(0, n|0));
    tx.set(
      ref,
      { hearts: next, updatedAt: serverTimestamp() },
      { merge: true }
    );
  });
}

/** n個回復（MAX_HEARTSを超えない） */
export async function addHearts(uid, n = 1) {
  if (!uid) throw new Error("uid is required");
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const cur = (snap.data()?.hearts ?? 0) | 0;
    const next = Math.min(MAX_HEARTS, cur + Math.max(0, n|0));
    tx.set(
      ref,
      { hearts: next, updatedAt: serverTimestamp() },
      { merge: true }
    );
  });
}

/** 直接セット（0〜MAXに丸める） */
export async function setHearts(uid, value) {
  if (!uid) throw new Error("uid is required");
  const v = Math.max(0, Math.min(MAX_HEARTS, Number(value) || 0));
  const db = getFirestoreDb();
  const ref = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    await tx.get(ref); // 存在チェック兼ねる（なくてもmerge setで作成）
    tx.set(
      ref,
      { hearts: v, updatedAt: serverTimestamp() },
      { merge: true }
    );
  });
}
