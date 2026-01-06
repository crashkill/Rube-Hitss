# Imperial SQL Executor - Simplified Version
# Executa SQL no Supabase Imperial

param(
    [string]$SqlFile = "supabase-recipes.sql"
)

Write-Host "=== Imperial SQL Executor ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se arquivo existe
if (-not (Test-Path $SqlFile)) {
    Write-Host "ERROR: File not found - $SqlFile" -ForegroundColor Red
    exit 1
}

# Ler SQL
$sql = Get-Content -Path $SqlFile -Raw -Encoding UTF8

Write-Host "File: $SqlFile" -ForegroundColor Yellow
Write-Host "Size: $($sql.Length) characters" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL Content copied to clipboard!" -ForegroundColor Green
Write-Host "Paste it in: https://supabase.fsw-hitss.duckdns.org/project/default/sql" -ForegroundColor Cyan
Write-Host ""

# Copiar para clipboard
$sql | Set-Clipboard

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
