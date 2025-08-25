# scripts/save-checkpoint.ps1 param( [string]$label = $(Get-Date -Format "yyyy-MM-dd_HHmm") ) $tag = "checkpoint-$label" Write-Host "▶ セーブデータ保存: $tag" git add -A git commit -m "checkpoint: $label (安定状態のセーブデータ保存)" --allow-empty git tag $tag -m "コード＋エミュDBの完全復元ポイント ($label)" # エミュDBをスナップショット保存（起動IDと合わせて！） npx firebase emulators:export .emu-data --project demo-gachaben --config ./firebase.json# scripts/save-checkpoint.ps1
param(
  [string]$label = $(Get-Date -Format "yyyy-MM-dd_HHmm")
)

$tag = "checkpoint-$label"

Write-Host "▶ セーブデータ保存: $tag"

git add -A
git commit -m "checkpoint: $label (安定状態のセーブデータ保存)" --allow-empty
git tag $tag -m "コード＋エミュDBの完全復元ポイント ($label)"

# エミュDBをスナップショット保存（起動IDと合わせて！）
npx firebase emulators:export .emu-data --project demo-gachaben --config ./firebase.json

Write-Host "✅ 完了: $tag を作成 & .emu-data 保存"
