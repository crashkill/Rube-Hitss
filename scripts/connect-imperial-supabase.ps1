# 🛰️ Script de Conexão - Supabase Imperial
# Configura variáveis de ambiente para uso do Supabase CLI com a instância self-hosted

param(
    [string]$Action = "setup",
    [string]$Query = "",
    [switch]$Test
)

# Credenciais Imperial (NÃO VERSIONAR EM PRODUÇÃO)
$SUPABASE_URL = "https://supabase.fsw-hitss.duckdns.org"
$SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc"

# ⚠️ ATENÇÃO: Obtenha a senha do banco via Coolify
# Acesse: https://fsw-hitss.duckdns.org/ → Supabase → Environment Variables → POSTGRES_PASSWORD
$DB_PASSWORD = "SUBSTITUA_PELA_SENHA_REAL"

$SUPABASE_DB_URL = "postgresql://postgres:$DB_PASSWORD@supabase.fsw-hitss.duckdns.org:5432/postgres"

Write-Host "🛰️ Supabase Imperial - Configuração CLI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Set-ImperialEnv {
    Write-Host "⚙️ Configurando variáveis de ambiente..." -ForegroundColor Yellow
    
    $env:SUPABASE_URL = $SUPABASE_URL
    $env:SUPABASE_ANON_KEY = $SUPABASE_ANON_KEY
    $env:SUPABASE_DB_URL = $SUPABASE_DB_URL
    
    Write-Host "✅ Variáveis configuradas:" -ForegroundColor Green
    Write-Host "   SUPABASE_URL: $env:SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.Substring(0, 30)}..." -ForegroundColor Gray
    Write-Host "   SUPABASE_DB_URL: postgresql://postgres:***@supabase.fsw-hitss.duckdns.org:5432/postgres" -ForegroundColor Gray
    Write-Host ""
}

function Test-Connection {
    Write-Host "🔍 Testando conectividade..." -ForegroundColor Yellow
    Write-Host ""
    
    # Teste 1: Ping no domínio
    Write-Host "1️⃣ Testando DNS/Rede..." -ForegroundColor Cyan
    $pingResult = Test-Connection -ComputerName "supabase.fsw-hitss.duckdns.org" -Count 2 -Quiet
    if ($pingResult) {
        Write-Host "   ✅ Servidor acessível" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Servidor não acessível" -ForegroundColor Red
        return
    }
    Write-Host ""
    
    # Teste 2: Query simples
    Write-Host "2️⃣ Testando query SQL..." -ForegroundColor Cyan
    try {
        $result = supabase db execute "SELECT current_database(), current_user, version()" --db-url $env:SUPABASE_DB_URL 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão com banco estabelecida" -ForegroundColor Green
            Write-Host "   Resultado:" -ForegroundColor Gray
            Write-Host "   $result" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Erro ao conectar: $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Erro ao executar query: $_" -ForegroundColor Red
    }
    Write-Host ""
    
    # Teste 3: Listar tabelas
    Write-Host "3️⃣ Listando tabelas públicas..." -ForegroundColor Cyan
    try {
        $tables = supabase db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name" --db-url $env:SUPABASE_DB_URL 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Tabelas encontradas:" -ForegroundColor Green
            Write-Host "   $tables" -ForegroundColor Gray
        } else {
            Write-Host "   ❌ Erro ao listar tabelas: $tables" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

function Invoke-CustomQuery {
    param([string]$SqlQuery)
    
    Write-Host "📊 Executando query customizada..." -ForegroundColor Yellow
    Write-Host "Query: $SqlQuery" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $result = supabase db execute "$SqlQuery" --db-url $env:SUPABASE_DB_URL 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Query executada com sucesso:" -ForegroundColor Green
            Write-Host "$result" -ForegroundColor White
        } else {
            Write-Host "❌ Erro ao executar query:" -ForegroundColor Red
            Write-Host "$result" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro: $_" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Help {
    Write-Host "📖 Uso do Script:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  .\connect-imperial-supabase.ps1 -Action setup" -ForegroundColor White
    Write-Host "    Configura variáveis de ambiente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\connect-imperial-supabase.ps1 -Test" -ForegroundColor White
    Write-Host "    Testa conectividade com a instância Imperial" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  .\connect-imperial-supabase.ps1 -Action query -Query 'SELECT * FROM recipes LIMIT 5'" -ForegroundColor White
    Write-Host "    Executa query customizada" -ForegroundColor Gray
    Write-Host ""
}

# Execução principal
switch ($Action.ToLower()) {
    "setup" {
        Set-ImperialEnv
        Write-Host "💡 Dica: Execute com -Test para verificar a conexão" -ForegroundColor Yellow
    }
    "query" {
        Set-ImperialEnv
        if ([string]::IsNullOrWhiteSpace($Query)) {
            Write-Host "❌ Erro: Query não fornecida. Use -Query 'SELECT ...'" -ForegroundColor Red
        } else {
            Invoke-CustomQuery -SqlQuery $Query
        }
    }
    "help" {
        Show-Help
    }
    default {
        Set-ImperialEnv
    }
}

if ($Test) {
    Set-ImperialEnv
    Test-Connection
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🛰️ Império Digital - CLI Operacional" -ForegroundColor Cyan
