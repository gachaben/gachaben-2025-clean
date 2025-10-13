// ------------------------------------------------------
// functions/src/index.ts
// Cloud Functions エントリーポイント (v1.7b対応)
// ------------------------------------------------------

import { createBattle } from "./createBattle"; // ← ./（ドット1つ）でOK

// ✅ Firebase はこのファイルを自動的にスキャンして
// export された関数を登録します。
export { createBattle };
