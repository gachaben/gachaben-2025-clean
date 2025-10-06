# 📘 Firestore スキーマ v2（2025-10対応）

> ✅ **目的：** v1.2仕様（学習・チャレンジ・バトルの三本柱＋カードシステム）に完全対応  
> 💡 `users`, `cards`, `problems`, `battles` を中心に設計  
> 🔐 ドキュメント変更時は **docs/spec-v1.2.md** と同期更新すること

---

## 🧍‍♂️ users/{uid}

```js
{
  name: string,                    // 表示名
  grade: number,                   // 学年（1〜6, etc）
  hearts: number,                  // 0〜5（スタミナ）
  heartsLastTickAt: Timestamp,     // ❤回復基準時刻
  battleTickets: number,           // 0〜3（バトル券）
  battleTicketsResetAt: Timestamp, // 翌0時の基準

  login: {
    lastLoginDate: string,         // YYYY-MM-DD
    streakDays: number,            // 連続ログイン日数
    lastRewardGiven: string|null   // 最終報酬日
  },

  daily: {
    date: string,                  // YYYY-MM-DD
    playedMinutes: number,         // 1日あたり学習時間
    clearedMissions: string[],     // ["calc", "kanji", "reading"]
  },

  gacha: {
    normal: number,
    premium: number
  },

  ownedCardIds: string[],          // cards コレクション参照

  ranks: {
    weeklyPoint: number,
    totalPoint: number
  },

  createdAt: Timestamp,
  updatedAt: Timestamp
}
🃏 cards/{cardId}
js
コードをコピーする
{
  name: string,
  key: string,
  description: string,
  attackEffect: {
    type: string,
    value: number
  },
  defenseEffect: {
    type: string,
    value: number
  },
  rarity: "B" | "A" | "S" | "PREMIUM",
  usesRequired: number,
  createdAt: Timestamp
}
🧠 problems/{problemId}
js
コードをコピーする
{
  grade: number,
  subject: "jp"|"math"|"sci"|"soc"|"eng",
  unit: string,
  type: "mcq"|"text"|"sequence"|"keypad",
  level: 1|2|3,
  body: {
    q: string,
    choices: string[],
    a: string
  },
  createdAt: Timestamp
}
❌ mistakes/{autoId}
js
コードをコピーする
{
  uid: string,
  problemId: string,
  subject: string,
  unit: string,
  question: string,
  answer: string,
  correct: string,
  source: "textbook"|"challenge"|"battle",
  createdAt: Timestamp,
  reviewed: boolean
}
⚔️ battles/{autoId}
js
コードをコピーする
{
  uid: string,
  opponentId: string,
  result: "win"|"lose"|"draw",
  rounds: number,
  usedCards: string[],
  earnedPoints: number,
  createdAt: Timestamp,
  rewarded: boolean
}
🎁 events/{autoId}
js
コードをコピーする
{
  uid: string,
  type: "ad_reward"|"gacha_draw"|"login_bonus"|"mission_clear"|"battle_win",
  meta: object,
  at: Timestamp
}
🌈 wallpaper/{id}
js
コードをコピーする
{
  theme: "insect"|"bread"|"animal"|string,
  color: "default"|"blue"|"red"|"gold",
  unlockMinutes: number,
  imageUrl: string,
  createdAt: Timestamp
}
🧩 関係図（概要）
pgsql
コードをコピーする
users
 ├── hearts / tickets / gacha
 ├── login.streakDays → ログイン報酬（S or PREMIUM）
 ├── ownedCardIds → cards/{cardId}
 └── solvedProblems → problems/{problemId}

cards
 ├── 攻撃・防御効果を両持ち
 └── usesRequired により発動制限

problems
 └── level・subject・unit で出題制御

mistakes
 └── 復習モード対象

battles
 └── result + usedCards + earnedPoints
✅ 運用ルール

仕様変更時はまず schema-v2.md を更新してからコード修正。

spec-v1.2.md にも整合性を取る。

新カード・壁紙を追加する際は seed スクリプト経由で投入。