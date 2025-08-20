// tools/gen-stub-from-legacy.mjs
// 使い方: node tools/gen-stub-from-legacy.mjs legacy_deprecated/<oldPath> <newPath>

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

const [ , , legacyPath, targetPath ] = process.argv;
if (!legacyPath || !targetPath) {
  console.error("usage: node tools/gen-stub-from-legacy.mjs legacy_deprecated/<oldPath> <newPath>");
  process.exit(1);
}

// legacy側のコードを読む（export名を抽出するため）
let src = "";
try {
  src = readFileSync(legacyPath, "utf8");
} catch (e) {
  // 読めなくても、とりあえず default だけ出して先に進む
  src = "";
}

const exports = new Set();
const patterns = [
  /export\s+function\s+([A-Za-z0-9_]+)/g,
  /export\s+class\s+([A-Za-z0-9_]+)/g,
  /export\s+(?:const|let|var)\s+([A-Za-z0-9_]+)/g,
  /export\s*{\s*([^}]+)\s*}/g, // export { a, b as c }
  /export\s+default\b/g
];

for (const re of patterns) {
  let m;
  while ((m = re.exec(src))) {
    if (re === patterns[3]) {
      m[1].split(",").forEach(s => {
        const name = s.trim().split(/\s+as\s+/i).pop();
        if (name) exports.add(name);
      });
    } else if (re === patterns[4]) {
      exports.add("default");
    } else {
      exports.add(m[1]);
    }
  }
}

const lines = [];
lines.push("// AUTO-GENERATED STUB (legacy removed)");
lines.push("// @STUB: returns neutral values");

// 最低限 default は用意
let hasDefault = false;

for (const name of exports) {
  if (name === "default") {
    hasDefault = true;
    lines.push("export default {};"); // 何も返さないオブジェクト
  } else {
    lines.push(`export function ${name}(){ /* noop */ }`);
  }
}
if (!hasDefault) {
  lines.push("export default {};");
}

// 書き出し
mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, lines.join("\n"));
console.log("stubbed:", targetPath);
