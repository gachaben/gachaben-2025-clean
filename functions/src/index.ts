import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

setGlobalOptions({ region: "asia-northeast1" }); // お好みのリージョンでOK
initializeApp();
const db = getFirestore();

type CreateBattleReq = {
  selectedItemId: string;
  questionCount: number;
};

export const createBattle = onCall<CreateBattleReq>(async (req) => {
  const auth = req.auth;
  if (!auth) throw new HttpsError("unauthenticated", "Sign in required.");

  const { selectedItemId, questionCount } = req.data || {};
  if (!selectedItemId || !questionCount) {
    throw new HttpsError("invalid-argument", "selectedItemId & questionCount required.");
  }

  // 必要なら items 参照で存在チェック
  // const itemSnap = await db.collection("items").doc(selectedItemId).get();

  const cpuItemId = `cpu_${selectedItemId}`;
  const seed = Math.random().toString(36).slice(2, 10);

  const battleRef = db.collection("battles").doc();
  const now = FieldValue.serverTimestamp();

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
    updatedAt: now
  };

  await battleRef.set(init);
  return { battleId: battleRef.id };
});
