# ============================================
# RUBE-LOCAL - ENVIRONMENT TEMPLATE
# ============================================
# Copie este arquivo para .env.local e preencha os valores
# ============================================

# ============================================
# COMPOSIO - Tool Router & Integrações
# ============================================
COMPOSIO_API_KEY=your_composio_api_key_here

# ============================================
# OPENAI - IA/LLM
# ============================================
OPENAI_API_KEY=your_openai_api_key_here

# ============================================
# SUPABASE - Database & Auth
# ============================================
# Para Supabase Cloud (padrão):
# NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Para Supabase Self-Hosted Imperial:
NEXT_PUBLIC_SUPABASE_URL=https://supabase.fsw-hitss.duckdns.org
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc2NTMxMjYyMCwiZXhwIjo0OTIwOTg2MjIwLCJyb2xlIjoiYW5vbiJ9.ROa02tImzr0KYvitB18aq3cmYEvn_v77nhYmhfL6kVc

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# NOTAS
# ============================================
# 1. Nunca commite este arquivo com secrets reais
# 2. O arquivo .env.local está no .gitignore
# 3. Para deploy, configure as variáveis no Coolify
