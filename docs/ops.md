ガチャ弁アプリ運用ルール（ops.md）

このファイルは「開発運用のルール帳」です。
Firebase・Git・環境設定・タグ命名など、すべての作業がここを基準に行われます。
docs/spec-v1.1.md（仕様） と docs/schema-v1.md（スキーマ） と並ぶ三本柱。

1. 環境設定（.envルール）
項目	内容
.env.local	ルート直下に配置（※ /src配下は禁止）
エミュ使用フラグ	VITE_USE_EMU=true
ポート番号	Firestore=8089 / Auth=9099 / Storage=9199
Project ID	gachaben-2025（共通）
✅ サンプル .env.local
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=gachaben-2025.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gachaben-2025
VITE_FIREBASE_STORAGE_BUCKET=gachaben-2025.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=0000000000
VITE_FIREBASE_APP_ID=1:0000000000:web:xxxx
VITE_USE_EMU=true
VITE_FIRESTORE_PORT=8089
VITE_AUTH_PORT=9099
VITE_STORAGE_PORT=9199

2. Firebase Emulator 起動方法
🔹 コマンド一覧
# Firestore / Auth / Storage 同時起動
npx firebase emulators:start --only auth,firestore,storage --project gachaben-2025

# 開発サーバー起動（別タブで）
npm run dev

🔹 ポート確認
サービス	ポート	URL
Firestore	8089	http://localhost:4000/firestore

Auth	9099	—
Storage	9199	—
Emulator UI	4000	http://127.0.0.1:4000/
🔹 動作確認手順

ブラウザ Console → [FBKIT] Firestore -> emulator ... と出ているか確認

http://127.0.0.1:4000/firestore
 を開き、problems / mistakes コレクションが見えること

scripts/seedProblems.js を実行してデータが入ればOK

3. Git運用ルール（絶対基準）
🔹 通常の保存

1つの作業完了ごとに小刻みに保存

コミットメッセージは日本語OK（例：「✅ 問題テストページ完成」）

まとめて残したい節目は「baselineタグ」を切る

git add .
git commit -m "✅ ProblemsTestPage 完成（mistake記録までOK）"

🔹 安定版の保存（baselineタグ）

baseline-YYYY-MM-DD_説明
例：baseline-2025-10-06_problems-test-ok

git tag -a baseline-2025-10-06_problems-test-ok -m "安定版：ProblemsTestPage 正常動作"
git push origin main --tags


→ これで、「ここに戻せば完全復元できる」ポイント を確保できます。

🔹 復元コマンド
# タグ一覧表示
git tag --list

# 指定タグに戻る（例：）
git checkout baseline-2025-10-06_problems-test-ok

🔹 作業中の分岐（ブランチ）
git checkout -b feature/review-mode


ブランチ名は以下のように付ける：

種類	命名例	内容
機能追加	feature/review-mode	新しい復習モードなど
修正	fix/firestore-path	Firestore関連修正
実験	test/ui-animation	UI検証・試作
4. ファイル更新の優先順位（迷ったらこれ）
優先	内容	理由
🥇 仕様ドキュメント（spec-v1.1.md）	アプリの動作・ルールを先に定義	コードがブレない
🥈 スキーマ（schema-v1.md）	Firestore構造を更新	データの整合性を維持
🥉 コード修正	React / Firebase実装	実装はドキュメントに合わせる

👉 「ドキュメント → コード」の順番で動くのがルール。
逆に「コードが先」になったら、必ず後でドキュメントを更新。

5. コミットメッセージテンプレート（推奨）
種類	プレフィックス	例
新機能	✨	✨ 復習モード初期実装
修正	🐛	🐛 Firestore パス修正
改善	♻️	♻️ 問題表示UIの簡素化
仕様更新	📝	📝 docs/schema-v1.md 更新
安定版保存	✅	✅ baseline 2025-10-06 保存
6. 長期開発のための運用方針

毎日の終わりに baseline タグを切る。
→ 翌日「どこから再開するか」が明確になる。

ドキュメントは常に最新に保つ。
→ ブランチごとに仕様がずれないよう、spec/schemaを最初に更新。

「今何をしているか」を作業メモに残す。
→ 例：作業メモ_2025-10-06.md を notes/ に置く。

7. 例：1日の作業の流れ
# 朝：エミュ起動
npx firebase emulators:start --only auth,firestore,storage --project gachaben-2025

# 開発開始
npm run dev

# 作業進行
# → ProblemsTestPage 改修
# → Mistake記録確認
# → UI確認

# コミット
git add .
git commit -m "✅ ProblemsTestPage 正常動作（mistake記録まで確認）"

# baseline保存
git tag -a baseline-2025-10-06_problems-test -m "安定版：テストページ動作完了"
git push origin main --tags

8. 今後の拡張予定（ops連動）
分類	内容	対応ファイル
バッチ処理	週次ランキング集計（Cloud Functions）	cloud/rankWeekly.js
スクリプト	問題データ投入	scripts/seedProblems.js
環境切替	本番／エミュ両対応	.env.local & fbkit/app.ts
データ検証	Firestore構造整合チェック	scripts/validateSchema.js
✅ 結論（運用の軸）

仕様は「spec-v1.1.md」

データ構造は「schema-v1.md」

開発ルールは「ops.md」

この3本柱があれば、他のどんなPC・ブランチ・時期でも 完全に同じ構造で再開 できます。