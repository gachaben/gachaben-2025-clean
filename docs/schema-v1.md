# Firestore スキーマ v1

## users/{uid}
```js
{
  hearts: number,                // 0..5
  heartsLastTickAt: Timestamp,   // ❤回復基点
  battleTickets: number,         // 0..3
  battleTicketsResetAt: Timestamp, // 翌0時に向けた基準
  solvedProblems: { [problemId]: { lastSolvedAt: Timestamp, level: 1|2|3 } },
  daily: {
    date: 'YYYY-MM-DD',
    textbookCleared: boolean,
    playedMin: number,
    calcDone: boolean, kanjiDone: boolean, readingDone: boolean
  },
  gacha: {
    normal: number, premium: number
  },
  ranks: { weeklyPoint: number, totalPoint: number }
}
