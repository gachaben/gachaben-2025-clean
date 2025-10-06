✅ ガチャ弁アプリ運用ルール（ops.md）

このファイルは「開発運用のルール帳」です。
Firebase・Git・環境設定・タグ命名など、すべての作業がここを基準に行われます。
docs/spec-v1.1.md（仕様）とdocs/schema-v1.md（スキーマ）と並ぶ三本柱です。

1. 環境設定（.envルール）
項目	内容
.env.local	ルート直下に配置（※ /src配下は禁止）
エミュ使用	VITE_USE_EMU=true
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

🔹 ポート確認表
サービス	ポート	URL
Firestore	8089	http://127.0.0.1:4000/firestore

Auth	9099	—
Storage	9199	—
Emulator UI	4000	http://127.0.0.1:4000/
3. Git運用ルール（絶対基準）
🔹 通常保存
git add .
git commit -m "✅ ProblemsTestPage 完成（mistake記録までOK）"

🔹 安定版保存（baselineタグ）
git tag -a baseline-2025-10-06_problems-test-ok -m "安定版：ProblemsTestPage 正常動作"
git push origin main --tags


これで「ここに戻せば完全復元できる」ポイントを確保。

🔹 復元コマンド
git tag --list
git checkout baseline-2025-10-06_problems-test-ok

4. ブランチ命名ルール
種類	命名例	内容
機能追加	feature/review-mode	新しい復習モードなど
修正	fix/firestore-path	Firestore関連修正
実験	test/ui-animation	UI検証・試作
5. ファイル更新優先順位
優先	内容	理由
🥇 spec-v1.1.md	仕様定義	コードがブレない
🥈 schema-v1.md	Firestore構造	データ整合性維持
🥉 実装コード	React/Firebase側	仕様・構造が決まってから実装
6. コミットテンプレート（推奨）
種類	プレフィックス	例
新機能	✨	✨ 復習モード初期実装
修正	🐛	🐛 Firestore パス修正
改善	♻️	♻️ 問題表示UIの簡素化
仕様更新	📝	📝 docs/schema-v1.md 更新
安定版保存	✅	✅ baseline 2025-10-06 保存
7. 日々の作業フロー例
# 朝：エミュ起動
npx firebase emulators:start --only auth,firestore,storage --project gachaben-2025

# 開発開始
npm run dev

# 作業中
# → ProblemsTestPage 改修
# → Mistake記録確認
# → UI確認

# 保存
git add .
git commit -m "✅ ProblemsTestPage 正常動作（mistake記録まで確認）"

# 安定タグ
git tag -a baseline-2025-10-06_problems-test -m "安定版：テストページ動作完了"
git push origin main --tags

8. 今後の拡張予定
分類	内容	対応ファイル
バッチ処理	週次ランキング集計（Cloud Functions）	cloud/rankWeekly.js
スクリプト	問題データ投入	scripts/seedProblems.js
環境切替	本番／エミュ対応	.env.local & fbkit/app.ts
データ検証	Firestore構造チェック	scripts/validateSchema.js
✅ 結論（運用の軸）

仕様 → spec-v1.1.md

データ構造 → schema-v1.md

運用ルール → ops.md

この3本柱さえあれば、
どのPC・ブランチ・時期でも 完全同一構造で再開可能。