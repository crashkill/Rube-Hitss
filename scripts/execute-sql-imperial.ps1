# 🛰️ Script Imperial: Executar SQL no Supabase Imperial
# Executa scripts SQL via API REST do Supabase

param(
    [Parameter(Mandatory=$true)]
    [string]$SqlFile,
    
    [string]$SupabaseUrl = "https://supabase.fsw-hitss.duckdns.org",
    [string]$AnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc"
)

Write-Host "🛰️ Executando SQL Imperial: $SqlFile" -ForegroundColor Cyan

# Verificar se o arquivo existe
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ Arquivo não encontrado: $SqlFile" -ForegroundColor Red
    exit 1
}

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content -Path $SqlFile -Raw

Write-Host "📄 Tamanho do script: $($sqlContent.Length) caracteres" -ForegroundColor Yellow

# Preparar headers
$headers = @{
    "apikey" = $AnonKey
    "Authorization" = "Bearer $AnonKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

# Endpoint para executar SQL (usando a API de RPC ou query direta)
# Nota: Supabase não tem endpoint direto para SQL arbitrário via REST API
# Vamos usar uma abordagem alternativa: salvar o SQL e instruir execução manual

Write-Host "⚠️  ATENÇÃO: A API REST do Supabase não permite execução direta de SQL DDL" -ForegroundColor Yellow
Write-Host "📋 Opções disponíveis:" -ForegroundColor Cyan
Write-Host "  1. Executar via Dashboard Web (SQL Editor)" -ForegroundColor White
Write-Host "  2. Instalar PostgreSQL Client (psql)" -ForegroundColor White
Write-Host "  3. Usar Supabase CLI com 'supabase db push'" -ForegroundColor White
Write-Host ""
Write-Host "💡 Recomendação Imperial: Instalar PostgreSQL Client Tools" -ForegroundColor Green
Write-Host "   Download: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 Conteúdo do SQL preparado para cópia:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host $sqlContent -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
