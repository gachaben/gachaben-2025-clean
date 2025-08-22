// src/lib/userState.js
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../legacy_deprecated/firebase"; // プロジェクトに合わせてパス調整OK

// users/{uid}
export const userDocRef = (uid) => doc(db, "users", uid);

// JSTの YYYY-MM-DD 文字列
function formatDateJST(d = new Date()) {
  const tzMin = 9 * 60; // +09:00
  const local = new Date(d.getTime() + tzMin * 60000);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ❤ 自動回復（15分/1、MAX=5）
export function computeHearts(nowMs, lastTickMs, hearts) {
  const MAX = 5;
  const STEP_MIN = 15;
  if ((hearts ?? 0) >= MAX) return { hearts: Math.min(MAX, hearts ?? 0), lastTick: lastTickMs || nowMs };

  const minutes = Math.floor((nowMs - (lastTickMs || nowMs)) / 60000);
  const gained = Math.floor(minutes / STEP_MIN);
  if (gained <= 0) return { hearts: hearts ?? 0, lastTick: lastTickMs || nowMs };

  const nextHearts = Math.min(MAX, (hearts ?? 0) + gained);
  const nextTick = (lastTickMs || nowMs) + gained * STEP_MIN * 60000;
  return { hearts: nextHearts, lastTick: nextTick };
}

// 初回ログイン時に users/{uid} を用意
export async function ensureUserDoc(uid) {
  const ref = userDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      hearts: 5,
      heartsLastTickAt: serverTimestamp(),
      battleTickets: 3,
      battleTicketsResetAt: serverTimestamp(),
      daily: {
        date: formatDateJST(),
        textbookCleared: false,
        playedMin: 0,
        calcDone: false,
        kanjiDone: false,
        readingDone: false,
      },
      gacha: { normal: 0, premium: 0 },
      ranks: { weeklyPoint: 0, totalPoint: 0 },
    });
  }
  return ref;
}

// 起動時に呼ぶ：❤自動回復＆バトル券日次リセット＆dailyローテーション
export async function refreshUserDaily(uid) {
  const ref = userDocRef(uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const u = snap.data() || {};

    // ❤回復
    const nowMs = Date.now();
    const lastTickMs =
      (u.heartsLastTickAt && u.heartsLastTickAt.toMillis && u.heartsLastTickAt.toMillis()) ||
      nowMs;
    const { hearts, lastTick } = computeHearts(nowMs, lastTickMs, u.hearts ?? 0);

    // バトル券：日付が変わっていたら 3 にリセット
    const lastReset = (u.battleTicketsResetAt?.toDate?.() ?? new Date());
    const lastResetStr = formatDateJST(lastReset);
    const todayStr = formatDateJST(new Date());
    const shouldResetTickets = lastResetStr !== todayStr;
    const nextTickets = shouldResetTickets ? 3 : (u.battleTickets ?? 0);

    // daily ローテーション
    const daily = u.daily || {};
    const shouldRollDaily = (daily.date !== todayStr);

    tx.update(ref, {
      hearts,
      heartsLastTickAt: new Date(lastTick),
      battleTickets: nextTickets,
      battleTicketsResetAt: shouldResetTickets ? serverTimestamp() : u.battleTicketsResetAt,
      ...(shouldRollDaily
        ? {
            daily: {
              date: todayStr,
              textbookCleared: false,
              playedMin: 0,
              calcDone: false,
              kanjiDone: false,
              readingDone: false,
            },
          }
        : {}),
    });
  });
}
