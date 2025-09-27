// scripts/seedProblems.js
import "dotenv/config";
import crypto from "node:crypto";
import { initializeApp } from "firebase/app";
import {
  getFirestore, connectFirestoreEmulator,
  doc, setDoc
} from "firebase/firestore";

// ---- 環境値（なければデフォルト） ----
const USE_EMU = (process.env.VITE_USE_EMU ?? "true") === "true";
const FS_PORT = Number(process.env.VITE_FIRESTORE_PORT ?? 8089); // あなたの環境に合わせて
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || "gachaben-2025";

// ---- Firebase 初期化（Emulator前提の軽量設定でOK）----
const app = initializeApp({ projectId: PROJECT_ID });
const db = getFirestore(app);
if (USE_EMU) {
  connectFirestoreEmulator(db, "localhost", FS_PORT);
  console.log(`[SEED] Firestore emulator -> localhost:${FS_PORT}, projectId=${PROJECT_ID}`);
}

// ---- ID を安定生成（同じ問題なら同じID = 上書き = 重複しない）----
function problemId(p) {
  const key = `${p.category}|${p.subject}|${p.grade}|${p.unit}|${p.body.question}`;
  const hash = crypto.createHash("md5").update(key).digest("hex").slice(0, 10);
  return `p_${p.category}_${p.subject}_${p.grade}_${hash}`;
}

// ---- ここに投入したい問題を並べる（例：教科書1問＋チャレンジ1問）----
const problems = [
  {
    grade: 3,
    subject: "math",
    unit: "かけ算",
    type: "mcq",
    level: 1,
    category: "textbook",
    body: {
      question: "3×4は？",
      choices: ["6", "7", "12", "14"],
      answer: 2
    }
  },
  {
    grade: 3,
    subject: "challenge",
    unit: "計算",
    type: "mcq",
    level: 1,
    category: "challenge",
    body: {
      question: "15+7は？",
      choices: ["20", "21", "22", "23"],
      answer: 2
    }
  }
];

// ---- 実行本体（同じIDで set = idempotent）----
async function main() {
  for (const p of problems) {
    const id = problemId(p);
    await setDoc(doc(db, "problems", id), p, { merge: false });
    console.log(`[SEED] upsert: ${id} (${p.body.question})`);
  }
  console.log("[SEED] done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
