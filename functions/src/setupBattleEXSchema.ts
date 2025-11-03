// ------------------------------------------------------
// 🔧 setupBattleEXSchema.ts（Firestore スキーマ初期化）
// ------------------------------------------------------
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// ✅ Emulator 接続設定
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8090";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100";
process.env.GOOGLE_APPLICATION_CREDENTIALS = ""; // ← 🔥 これが重要

// ✅ Admin 初期化
if (!admin.apps.length) {
  admin.initializeApp({ projectId: "gachaben-2025" });
  console.log("✅ Firebase Admin initialized");
}

const db = admin.firestore();
const schemaPath = path.resolve(__dirname, "./schema/battleEX.json");
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));

(async () => {
  try {
    console.log("🚀 Setting up Firestore BattleEX Schema...");

    for (const [collectionName] of Object.entries(schema.collections)) {
      const ref = db.collection(collectionName as string);
      await ref.doc("_example").set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Initialized collection: ${collectionName}`);
    }

    console.log("🎉 Schema setup complete!");
  } catch (err) {
    console.error("❌ Error during schema setup:", err);
  } finally {
    process.exit(0);
  }
})();
