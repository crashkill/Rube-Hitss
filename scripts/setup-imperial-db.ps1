# 🛰️ Script Imperial: Setup Completo do Banco de Dados
# Executa todos os scripts SQL necessários no Supabase Imperial

$ErrorActionPreference = "Stop"

# Configurações do Supabase Imperial
$SUPABASE_URL = "https://supabase.fsw-hitss.duckdns.org"
$SUPABASE_HOST = "supabase.fsw-hitss.duckdns.org"
$SUPABASE_PORT = "5432"
$SUPABASE_DB = "postgres"
$SUPABASE_USER = "postgres"

Write-Host "🛰️ Setup Imperial do Banco de Dados Rube-Local" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""

# Verificar se psql está disponível
$psqlAvailable = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)

if (-not $psqlAvailable) {
    Write-Host "❌ PostgreSQL Client (psql) não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Para instalar o PostgreSQL Client:" -ForegroundColor Yellow
    Write-Host "  1. Via Chocolatey (recomendado):" -ForegroundColor White
    Write-Host "     choco install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Via Download direto:" -ForegroundColor White
    Write-Host "     https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Via Scoop:" -ForegroundColor White
    Write-Host "     scoop install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Alternativa: Executar via Dashboard Web do Supabase" -ForegroundColor Cyan
    Write-Host "   URL: $SUPABASE_URL/project/default/sql" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ PostgreSQL Client encontrado!" -ForegroundColor Green
Write-Host ""

# Solicitar senha do banco
Write-Host "🔐 Digite a senha do PostgreSQL (POSTGRES_PASSWORD do Coolify):" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Configurar variável de ambiente para senha
$env:PGPASSWORD = $password

Write-Host ""
Write-Host "📋 Executando scripts SQL..." -ForegroundColor Cyan
Write-Host ""

# Script 1: Setup básico (conversations, messages)
Write-Host "1️⃣  Executando supabase-setup.sql..." -ForegroundColor White
try {
    psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -f "supabase-setup.sql"
    Write-Host "   ✅ supabase-setup.sql executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao executar supabase-setup.sql: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Script 2: Recipes
Write-Host "2️⃣  Executando supabase-recipes.sql..." -ForegroundColor White
try {
    psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -f "supabase-recipes.sql"
    Write-Host "   ✅ supabase-recipes.sql executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro ao executar supabase-recipes.sql: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host "🎉 Setup do banco de dados concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verificando tabelas criadas..." -ForegroundColor Cyan

# Verificar tabelas
$verifyQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
"@

echo $verifyQuery | psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB

Write-Host ""
Write-Host "✅ Missão Imperial concluída!" -ForegroundColor Green

# Limpar senha da memória
$env:PGPASSWORD = $null
