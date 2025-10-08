// scripts/cleanup-safe.js
import fs from "fs";
import path from "path";
import os from "os";

const projectRoot = path.resolve("./");
const trashDir = path.join(os.homedir(), ".gachaben_trash_" + Date.now());

// 移動対象（あなたがチェックしたもの）
const targets = [
  "src/pages/OldBattlePage.jsx",
  "src/pages/ReviewQuickStart_old.jsx",
  "src/pages/ProblemsTestPage.jsx",
  "src/pages/HistoryPage.jsx",
  "scripts/seedProblems_old.js",
  "scripts/temp.js",
  "scripts/test.js",
  "scripts/backup/",
  "public/images/temp/",
  "public/images/debug/",
  "public/images/effects/test/",
  "docs/old_spec.md",
  "src/components/UnusedModal.jsx",
  "src/styles/test.css",
];

// 安全に移動（削除ログ付き）
fs.mkdirSync(trashDir, { recursive: true });
console.log("🧹 削除ファイルを一時退避します:", trashDir, "\n");

for (const relPath of targets) {
  const absPath = path.join(projectRoot, relPath);
  if (fs.existsSync(absPath)) {
    const destPath = path.join(trashDir, relPath.replace(/\//g, "_"));
    fs.renameSync(absPath, destPath);
    console.log("✅ 移動:", relPath);
  } else {
    console.log("⚠️ 見つからない:", relPath);
  }
}

console.log("\n🎉 完了！誤削除時は以下のフォルダから復元できます：");
console.log(trashDir);
