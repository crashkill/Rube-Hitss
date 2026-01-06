# 🛰️ Supabase CLI - Guia Imperial

## 📋 Visão Geral

Este documento descreve como utilizar o **Supabase CLI** para gerenciar a instância **Supabase Imperial** self-hosted sem depender do browser.

| Propriedade | Valor |
|-------------|-------|
| **URL Supabase Imperial** | `https://supabase.fsw-hitss.duckdns.org` |
| **Anon Key** | `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc` |
| **Versão CLI instalada** | `2.48.3` |

---

## 🚀 Instalação

O Supabase CLI já está instalado. Para verificar:

```powershell
supabase --version
```

Para atualizar para a versão mais recente:

```powershell
# Windows (via Scoop)
scoop update supabase

# Ou via NPM
npm update -g supabase
```

---

## ⚙️ Configuração Inicial

### 1. Inicializar Projeto (Já feito)

```powershell
cd "C:\Users\fabricio.lima\OneDrive - HITSS DO BRASIL SERVIÇOS TECNOLOGICOS LTDA\Área de Trabalho - Antiga\Projetos React\Rube-Local"
supabase init
```

Isso cria a estrutura:
```
/supabase
  ├── config.toml       # Configuração do projeto
  ├── .gitignore
  └── .temp/
```

### 2. Conectar à Instância Imperial

Para conectar o CLI à instância self-hosted, use variáveis de ambiente:

```powershell
# Definir variáveis de ambiente (sessão atual)
$env:SUPABASE_URL = "https://supabase.fsw-hitss.duckdns.org"
$env:SUPABASE_ANON_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc"
$env:SUPABASE_DB_URL = "postgresql://postgres:your-db-password@supabase.fsw-hitss.duckdns.org:5432/postgres"
```

> **⚠️ IMPORTANTE**: Substitua `your-db-password` pela senha real do banco de dados PostgreSQL.

---

## 🎯 Comandos Essenciais

### Executar Queries SQL

```powershell
# Query direta
supabase db execute "SELECT * FROM recipes LIMIT 10"

# Executar arquivo SQL
supabase db execute -f scripts/migrate-to-imperial.sql

# Executar com output formatado
supabase db execute "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" --output json
```

### Gerenciar Migrations

```powershell
# Criar nova migration
supabase migration new add_new_table

# Aplicar migrations pendentes
supabase db push

# Ver status das migrations
supabase migration list

# Gerar diff do schema atual
supabase db diff --schema public
```

### Dump do Banco de Dados

```powershell
# Exportar apenas schema
supabase db dump --schema-only > schema.sql

# Exportar dados
supabase db dump --data-only > data.sql

# Exportar schema + dados
supabase db dump > full-backup.sql

# Exportar tabela específica
supabase db dump --table recipes > recipes-backup.sql
```

### Gerenciar Funções e Triggers

```powershell
# Listar funções
supabase db execute "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'"

# Criar função via arquivo
supabase db execute -f supabase/functions/my-function.sql
```

### Logs e Monitoramento

```powershell
# Ver logs do Postgres (se rodando localmente)
supabase db logs

# Ver logs de Edge Functions
supabase functions logs <function-name>
```

---

## 📊 Queries Úteis para Administração

### Listar todas as tabelas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Ver estrutura de uma tabela

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'recipes'
ORDER BY ordinal_position;
```

### Verificar tamanho das tabelas

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Listar usuários autenticados

```sql
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🔧 Workflow Recomendado

### 1. Desenvolvimento Local → Imperial

```powershell
# 1. Fazer alterações no schema local
supabase db reset  # Resetar DB local

# 2. Gerar migration das mudanças
supabase db diff -f new_migration

# 3. Aplicar na instância Imperial
supabase db push --db-url $env:SUPABASE_DB_URL
```

### 2. Backup Regular

```powershell
# Criar backup completo
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
supabase db dump > "backups/imperial-backup-$timestamp.sql"
```

### 3. Sincronizar Schema

```powershell
# Exportar schema da Imperial
supabase db dump --schema-only --db-url $env:SUPABASE_DB_URL > schema-imperial.sql

# Comparar com local
supabase db diff --schema public
```

---

## 🛡️ Segurança Imperial

### Variáveis de Ambiente Persistentes

Para evitar expor credenciais, crie um arquivo `.env.supabase` (NÃO versionar):

```env
SUPABASE_URL=https://supabase.fsw-hitss.duckdns.org
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@supabase.fsw-hitss.duckdns.org:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Carregar antes de usar o CLI:

```powershell
# PowerShell
Get-Content .env.supabase | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
```

---

## 📝 Scripts Úteis

### Script: Executar Query e Salvar Resultado

```powershell
# query-imperial.ps1
param(
    [string]$Query,
    [string]$OutputFile = "query-result.json"
)

$env:SUPABASE_DB_URL = "postgresql://postgres:PASSWORD@supabase.fsw-hitss.duckdns.org:5432/postgres"

supabase db execute "$Query" --output json | Out-File -FilePath $OutputFile
Write-Host "✅ Resultado salvo em: $OutputFile"
```

Uso:
```powershell
.\query-imperial.ps1 -Query "SELECT * FROM recipes" -OutputFile "recipes.json"
```

---

## 🚨 Troubleshooting

### Erro: "connection refused"

```powershell
# Verificar se a URL está correta
ping supabase.fsw-hitss.duckdns.org

# Testar conexão direta com psql
psql "postgresql://postgres:PASSWORD@supabase.fsw-hitss.duckdns.org:5432/postgres"
```

### Erro: "authentication failed"

Verifique se:
1. A senha do PostgreSQL está correta
2. O usuário tem permissões adequadas
3. A instância Supabase está rodando no Coolify

### Erro: "SSL required"

Adicione `?sslmode=require` à connection string:

```powershell
$env:SUPABASE_DB_URL = "postgresql://postgres:PASSWORD@supabase.fsw-hitss.duckdns.org:5432/postgres?sslmode=require"
```

---

## 📚 Referências

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

**"O controle do banco de dados está nas suas mãos, comandante. Use-o com sabedoria."**

🛰️ **Império Digital - Supabase CLI Operacional**
