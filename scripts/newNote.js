// scripts/newNote.js
import fs from "fs";
import path from "path";

// notesフォルダのパス
const notesDir = path.resolve("notes");

// 今日の日付を取得（例：2025-10-07）
const date = new Date().toISOString().split("T")[0];
const fileName = `作業メモ_${date}.md`;
const filePath = path.join(notesDir, fileName);

// フォルダがなければ自動作成
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// すでに存在する場合は上書きしない
if (fs.existsSync(filePath)) {
  console.log(`📒 既に作業メモがあります → ${filePath}`);
  process.exit(0);
}

// テンプレート本文
const content = `# 📝 作業メモ ${date}

## 🎯 今日の目的
- 

## 🔧 作業内容
| 時間帯 | 作業 | 結果／備考 |
|--------|------|------------|
|  |  |  |

## ✅ 次回タスク
- [ ] 

## 💾 自動記録
- 生成日時: ${new Date().toLocaleString("ja-JP")}
- 作成スクリプト: scripts/newNote.js
`;

fs.writeFileSync(filePath, content);
console.log(`✅ 作業メモを作成しました: ${filePath}`);
