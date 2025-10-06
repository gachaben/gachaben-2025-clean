// scripts/seedMistakes.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// ---- .env.local を優先して読み込む ----
const cwd = process.cwd();
const envLocalPath = path.resolve(cwd, ".env.local");
const envPath = fs.existsSync(envLocalPath) ? envLocalPath : path.resolve(cwd, ".env");
dotenv.config({ path: envPath });

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  connectFirestoreEmulator,
} from "firebase/firestore";

// ---- 環境変数 ----
const USE_EMU = String(process.env.VITE_USE_EMU).toLowerCase() === "true";
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "demo-gachaben";
const FIRESTORE_PORT = Number(process.env.VITE_FIRESTORE_PORT || 8089);

// ---- デバッグ表示（必ず出るように）----
console.log("[ENV] file:", envPath);
console.log("[ENV] USE_EMU =", USE_EMU, "PROJECT_ID =", PROJECT_ID, "PORT =", FIRESTORE_PORT);

// ---- Firebase 初期化（projectId は必須）----
const firebaseConfig = {
  apiKey: "fake-api-key", // emulator 用なのでダミーでOK
  projectId: PROJECT_ID,
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---- Emulator 接続（保険で env も立てる）----
if (USE_EMU) {
  // 保険：SDK が env を見てくれるケース向け
  process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${FIRESTORE_PORT}`;
  connectFirestoreEmulator(db, "127.0.0.1", FIRESTORE_PORT);
  console.log(`[FBKIT] Firestore -> emulator (${FIRESTORE_PORT})`);
} else {
  console.log("[FBKIT] Firestore -> 本番（危険）");
}

// ---- 最小テスト用 MCQ データ ----
async function seed() {
  const ref = doc(collection(db, "mistakes"));
  await setDoc(ref, {
    type: "mcq",
    body: "1 + 1 は？",
    options: ["1", "2", "3"],
    answer: "2",
    createdAt: serverTimestamp(),
  });
  console.log("✅ mistakes に MCQ 1件追加:", ref.id);
}

seed().then(() => process.exit()).catch((e) => {
  console.error("❌ 失敗:", e);
  process.exit(1);
});
