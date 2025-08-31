// src/lib/grantBattleRewards.js
import { db } from "@/fbkit";
import {
  doc, runTransaction, increment, getDoc, serverTimestamp,
} from "firebase/firestore";
import { getFirebaseAuth } from "@/fbkit";

export async function grantBattleRewards(battleId) {
  const auth = getFirebaseAuth();
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");

  const battleRef = doc(db, "battles", battleId);
  const userRef = doc(db, "users", uid);

  return await runTransaction(db, async (tx) => {
    const [battleSnap, userSnap] = await Promise.all([
      tx.get(battleRef),
      tx.get(userRef),
    ]);

    if (!battleSnap.exists()) throw new Error("Battle not found");
    const battle = battleSnap.data();

    if (battle.userId !== uid) throw new Error("This battle is not yours");
    if (battle.rewardsClaimed) {
      return { alreadyClaimed: true, bptEarned: battle._bptEarned ?? 0 };
    }

    const base = 5; // 参加報酬
    const bonus = battle.winner === "you" ? 10 : 0;
    const bptEarned = base + bonus;

    // users/{uid}.bpt をインクリメント（無ければ0から�E�E
    tx.set(
      userRef,
      {
        bpt: increment(bptEarned),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // battle に受取済みフラグ & 実際に付与した量を記録
    tx.update(battleRef, {
      rewardsClaimed: true,
      _bptEarned: bptEarned,
      rewardsClaimedAt: serverTimestamp(),
    });

    return { alreadyClaimed: false, bptEarned };
  });
}
