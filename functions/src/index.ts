// ------------------------------------------------------
// ⚔️ index.ts（v2.1 完全統合版）
// Firebase Functions Entry Point
// ------------------------------------------------------
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ------------------------------------------------------
// ✅ Firebase 初期設定
// ------------------------------------------------------
setGlobalOptions({ region: "asia-northeast1" });
initializeApp();
const db = getFirestore();

// ------------------------------------------------------
// ⚔️ createBattle（バトル券チェック＋消費＋初期化）
// ------------------------------------------------------
export const createBattle = onCall(
  async (req: any): Promise<{ battleId: string; ticketsLeft: number }> => {
    const auth = req.auth;
    if (!auth)
      throw new HttpsError("unauthenticated", "サインインが必要です。");

    const { selectedItemId, questionCount } = req.data || {};
    if (!selectedItemId || !questionCount) {
      throw new HttpsError(
        "invalid-argument",
        "selectedItemId と questionCount は必須です。"
      );
    }

    const userRef = db.collection("users").doc(auth.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      throw new HttpsError("not-found", "ユーザーが存在しません。");
    }

    const userData = userSnap.data() || {};
    const currentTickets = userData.tickets ?? 0;

    // 🎫 チケットが不足していたらエラー
    if (currentTickets <= 0) {
      throw new HttpsError(
        "failed-precondition",
        "バトル券が足りません。チャレンジ問題か広告で入手してください。"
      );
    }

    // 🎫 バトル券を1枚消費
    await userRef.update({
      tickets: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // CPUデータ生成
    const cpuItemId = `cpu_${selectedItemId}`;
    const seed = Math.random().toString(36).slice(2, 10);
    const now = FieldValue.serverTimestamp();

    // バトル初期データ
    const battleRef = db.collection("battles").doc();
    const init = {
      ownerUid: auth.uid,
      selectedItemId,
      enemyItemId: cpuItemId,
      enemyType: "CPU",
      questionCount,
      seed,
      phase: "enemyPick",
      round: 1,
      myPwLeft: 300,
      enemyPwLeft: 300,
      myBet: null as number | null,
      enemyBet: null as number | null,
      currentQuestionId: null as string | null,
      createdAt: now,
      updatedAt: now,
    };

    await battleRef.set(init);

    console.log(
      `🎫 バトル券を1枚消費 (${currentTickets - 1} 枚残り) [uid=${auth.uid}]`
    );
    console.log(`⚔️ 新規バトル作成: ${battleRef.id}`);

    return { battleId: battleRef.id, ticketsLeft: currentTickets - 1 };
  }
);
