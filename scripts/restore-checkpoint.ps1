# scripts/restore-checkpoint.ps1
param(
  [string]$tag = "checkpoint-latest"  # 例: checkpoint-2025-08-24_1530
)

Write-Host "▶ 復元: $tag にコードを戻します"
git fetch --tags
git reset --hard $tag
git clean -xfd

Write-Host "▶ 依存を再インストール"
npm ci

Write-Host "▶ エミュDBは .emu-data から自動復元されます（package.json設定）"
npm run dev:emu
