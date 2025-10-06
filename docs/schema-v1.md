✅ Firestore スキーマ v1（最終保存版）

このファイルは「データの背骨」です。
アプリが Firestore にどんなデータを持つかを全てここで定義します。
クライアントコードや seed スクリプトを変更する前に、必ずここを確認・更新すること。

1. users/{uid}
{
  hearts: number,                // 0..5
  heartsLastTickAt: Timestamp,   // ❤ 回復基点
  battleTickets: number,         // 0..3
  battleTicketsResetAt: Timestamp, // 翌0時リセット用

  // 学習履歴
  solvedProblems: {
    [problemId]: {
      lastSolvedAt: Timestamp,
      level: 1 | 2 | 3
    }
  },

  // デイリーミッション進行
  daily: {
    date: 'YYYY-MM-DD',
    textbookCleared: boolean,
    playedMin: number,
    calcDone: boolean,
    kanjiDone: boolean,
    readingDone: boolean
  },

  // ガチャ券・報酬系
  gacha: {
    normal: number,
    premium: number
  },

  // ランキング・戦績
  ranks: {
    weeklyPoint: number,
    totalPoint: number
  }
}

2. problems/{problemId}
{
  grade: number,                               // 学年
  subject: 'jp' | 'math' | 'sci' | 'soc' | 'eng',
  unit: string,                                // 単元名（例：「かけ算」）
  category: 'textbook' | 'challenge' | 'event',// 出題区分
  type: 'mcq' | 'keypad' | 'sequence' | 'text', // 問題形式
  level: 1 | 2 | 3,                            // 難易度
  body: {
    q: string,   // 問題文
    a: string,   // 正答
    choices?: string[] // 選択肢（必要に応じて）
  }
}

3. mistakes/{autoId}
{
  uid: string,            // 回答者UID（未ログインなら "guest"）
  problemId: string,
  question: string,
  answer: string,
  correct: string,
  createdAt: Timestamp
}

4. events/{autoId}（将来分析用）
{
  uid: string,
  type: 'ad_reward' | 'battle_win' | 'gacha_draw' | 'mission_clear',
  meta: object,
  at: Timestamp
}

5. 今後予定のコレクション
コレクション名	目的	実装タイミング
ranksWeekly	週次ランキング集計キャッシュ	Cloud Functions 実装時
battles	バトルログ記録	後期フェーズ
missions	デイリー／ウィークリーミッション管理	後期フェーズ
✅ 補足メモ

problems・mistakes は既に実装済み。

users はハート管理・デイリー・ランキングまでカバー済み。

events や battles を追加する際は、必ずこのファイルを更新してからコードを変更すること。

📘 スキーマ更新ルール

schema-v1.md を更新

spec-v1.1.md の「12. Firestoreスキーマ」章も更新

コミット名：📝 docs/schema-v1.md 更新