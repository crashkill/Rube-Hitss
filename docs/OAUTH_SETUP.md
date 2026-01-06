# 🔐 Configuração OAuth - Rube-Local

## Providers Configurados

O Rube-Local agora suporta login via:
- **Google** ✅
- **GitHub** 🆕  
- **Slack** 🆕

---

## 📋 Configuração no Supabase Dashboard

### 1. GitHub OAuth

1. **Acesse GitHub Developer Settings:**
   - Vá para: https://github.com/settings/developers
   - Clique em **"New OAuth App"**

2. **Configure a aplicação:**
   | Campo | Valor |
   |-------|-------|
   | Application name | `Rube by Composio` |
   | Homepage URL | `http://localhost:3000` (dev) ou sua URL de produção |
   | Authorization callback URL | `https://[SEU_SUPABASE_URL]/auth/v1/callback` |

3. **Copie as credenciais:**
   - Client ID
   - Client Secret

4. **Configure no Supabase:**
   - Acesse: https://supabase.fsw-hitss.duckdns.org
   - Vá em **Authentication > Providers > GitHub**
   - Cole Client ID e Client Secret
   - Ative o provider

---

### 2. Slack OAuth

1. **Acesse Slack API:**
   - Vá para: https://api.slack.com/apps
   - Clique em **"Create New App"**
   - Escolha **"From scratch"**

2. **Configure a aplicação:**
   | Campo | Valor |
   |-------|-------|
   | App Name | `Rube by Composio` |
   | Workspace | Selecione seu workspace |

3. **Configure OAuth & Permissions:**
   - Vá em **OAuth & Permissions**
   - Adicione Redirect URL: `https://[SEU_SUPABASE_URL]/auth/v1/callback`
   - Scopes necessários:
     - `identity.basic`
     - `identity.email`

4. **Copie as credenciais:**
   - Client ID (de Basic Information)
   - Client Secret (de Basic Information)

5. **Configure no Supabase:**
   - Acesse: https://supabase.fsw-hitss.duckdns.org
   - Vá em **Authentication > Providers > Slack**
   - Cole Client ID e Client Secret
   - Ative o provider

---

## 🔗 Redirect URLs

Para o Supabase Self-Hosted Imperial:
```
https://supabase.fsw-hitss.duckdns.org/auth/v1/callback
```

Para desenvolvimento local:
```
http://localhost:54321/auth/v1/callback
```

---

## ✅ Verificação

Após configurar, teste cada provider:

1. Acesse http://localhost:3000
2. Clique em "Sign out" se estiver logado
3. Tente fazer login com cada provider
4. Verifique se o usuário é criado no Supabase Auth

---

## 🔒 Segurança

> **⚠️ IMPORTANTE:** Nunca commite Client Secrets no repositório!

As credenciais OAuth são armazenadas apenas no dashboard do Supabase.
