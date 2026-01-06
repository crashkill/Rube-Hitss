# 🛰️ Supabase Imperial - Variáveis de Ambiente
# Template para configuração do Supabase CLI
# 
# INSTRUÇÕES:
# 1. Copie este arquivo para .env.supabase
# 2. Preencha os valores reais (especialmente DB_PASSWORD)
# 3. NUNCA versione o arquivo .env.supabase no Git
# 4. Carregue as variáveis antes de usar o CLI

# URL da instância Supabase Imperial (self-hosted)
SUPABASE_URL=https://supabase.fsw-hitss.duckdns.org

# Anon Key (chave pública para autenticação)
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc

# ⚠️ OBTENHA A SENHA REAL DO POSTGRES VIA COOLIFY:
# Acesse: https://fsw-hitss.duckdns.org/ → Supabase Service → Environment Variables → POSTGRES_PASSWORD
DB_PASSWORD=SUBSTITUA_PELA_SENHA_REAL

# Connection String completa do PostgreSQL
SUPABASE_DB_URL=postgresql://postgres:${DB_PASSWORD}@supabase.fsw-hitss.duckdns.org:5432/postgres

# Service Role Key (admin - use com cuidado)
# SUPABASE_SERVICE_ROLE_KEY=obtenha_via_coolify_se_necessario

# JWT Secret (para validação de tokens)
# SUPABASE_JWT_SECRET=obtenha_via_coolify_se_necessario
