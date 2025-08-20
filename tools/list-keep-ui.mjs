// tools/list-keep-ui.mjs  （rg不要・Nodeだけで動く）
import fg from "fast-glob";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname } from "path";

const OUT = "docs/keep_ui_list.md";
const B = /(heart|hearts|maxHearts|life|gacha|odds|pool|mission|ミッション|ranking|leaderboard|weekly|週末|problem|solved|history|履歴|level[ _-]?[123])/i;
const A = /(PW|CPT|BPT|Story|Challenge|infinite.*heart|stamina|無限.*(ハート|ライフ))/i;

const patterns = [
  "src/**/*.{ts,tsx,js,jsx}",
  "!**/legacy_deprecated/**",
  "!**/node_modules/**"
];

const files = await fg(patterns, { dot: false });

const keep = [];
for (const f of files) {
  try {
    const src = readFileSync(f, "utf8");
    if (B.test(src) && !A.test(src)) keep.push(f);
  } catch {}
}

mkdirSync(dirname(OUT), { recursive: true });
let md = `# B群（残すUI）自動抽出\n\n生成: ${new Date().toISOString()}\n\n## 該当ファイル\n\n`;
for (const f of keep.sort()) md += `- \`${f}\`\n`;
writeFileSync(OUT, md);
console.log("✅ 出力:", OUT, `(count: ${keep.length})`);

// 先頭に @KEEP 追記（重複防止）
for (const f of keep) {
  try {
    const src = readFileSync(f, "utf8");
    if (!src.startsWith("// @KEEP")) {
      writeFileSync(f, `// @KEEP 理由: 柱（❤/ガチャ/ミッション/ランキング/問題履歴）に一致\n` + src);
    }
  } catch {}
}
console.log("🔖 各ファイルへ @KEEP を付与しました");
