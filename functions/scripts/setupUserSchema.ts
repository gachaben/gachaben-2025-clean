// ------------------------------------------------------
// 🔧 setupUserSchema.ts（usersコレクション初期化スクリプト）
// ------------------------------------------------------
import * as admin from "firebase-admin";

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8090";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100";

if (!admin.apps.length) {
  admin.initializeApp({ projectId: "gachaben-2025" });
  console.log("✅ Firebase Admin initialized");
}

const db = admin.firestore();

(async () => {
  try {
    const uid = "debug-user";
    const ref = db.collection("users").doc(uid);

    await ref.set(
      {
        uid,
        name: "テストユーザー",
        grade: 3,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: new Date().toISOString(),
        tickets: 5,
        premiumTickets: 0,
        currentBattleStreak: 0,
        bestBattleStreak: 0,
        continueStreak: false,
        stats: {
          doremiPoints: 0,
          battleNotes: 0,
          lessonsCleared: 0,
          challengesCleared: 0,
          bonusCleared: 0,
          specialCleared: 0,
          exp: 0,
          level: 1,
        },
      },
      { merge: true }
    );

    console.log("🎉 users/debug-user initialized!");
  } catch (err) {
    console.error("❌ Error initializing user schema:", err);
  } finally {
    process.exit(0);
  }
})();
