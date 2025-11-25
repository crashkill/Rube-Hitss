# 🔧 Como Configurar os Apps no Open Rube

## ⚠️ Problema Atual

Os apps não aparecem na aba "Apps" porque o projeto depende de **Auth Configs** criadas manualmente no Composio com um nome específico contendo "toolRouter".

## ✅ Solução Recomendada

O Open Rube usa o **Tool Router** do Composio, que é uma feature experimental que gerencia automaticamente a autenticação. Existem duas abordagens:

---

### **Opção 1: Usar Tool Router (Recomendado)**

O Tool Router gerencia automaticamente as conexões sem precisar de auth configs pré-configuradas.

**Como funciona:**
1. O Tool Router descobre automaticamente quais ferramentas são necessárias
2. Gerencia a autenticação automaticamente
3. Executa as ferramentas em paralelo

**Limitação atual:**
- O código atual do Open Rube está configurado para buscar auth configs manuais
- Precisaria refatorar para usar o Tool Router diretamente

---

### **Opção 2: Criar Auth Configs Manualmente (Solução Temporária)**

Até refatorarmos o código, você pode criar auth configs manualmente no dashboard do Composio:

#### **Passo a Passo:**

1. **Acesse o Dashboard do Composio:**
   - https://platform.composio.dev/

2. **Vá para "Authentication Management":**
   - Clique em "Manage authentication with custom credentials"

3. **Para cada app que deseja disponibilizar, crie um Auth Config:**

   **Exemplo para Gmail:**
   - Clique em "Create Auth Config"
   - Selecione **Gmail** como toolkit
   - Nome: `gmail-toolrouter-config` (importante ter "toolrouter" no nome!)
   - Configure OAuth2:
     - Client ID: (do Google Cloud Console)
     - Client Secret: (do Google Cloud Console)
     - Redirect URI: `https://backend.composio.dev/api/v3/toolkits/auth/callback`

   **Exemplo para GitHub:**
   - Nome: `github-toolrouter-config`
   - Configure OAuth2 com credenciais do GitHub

   **Exemplo para Slack:**
   - Nome: `slack-toolrouter-config`
   - Configure OAuth2 com credenciais do Slack

4. **Apps Populares para Configurar:**
   - Gmail
   - Slack
   - GitHub
   - Google Calendar
   - Notion
   - Trello
   - Asana
   - Jira

---

### **Opção 3: Refatorar para Tool Router Puro (Melhor a Longo Prazo)**

Modificar o código para usar o Tool Router diretamente, eliminando a necessidade de auth configs manuais.

**Vantagens:**
- ✅ Não precisa configurar auth configs manualmente
- ✅ Gerenciamento automático de autenticação
- ✅ Suporta 500+ apps automaticamente
- ✅ Execução paralela de ferramentas

**Desvantagens:**
- ⚠️ Requer refatoração significativa do código
- ⚠️ Feature experimental do Composio

---

## 📚 Documentação Útil

- **Tool Router Quick Start:** https://docs.composio.dev/docs/tool-router/quick-start
- **Auth Config Guide:** https://docs.composio.dev/guides/authentication/auth-config
- **Composio Dashboard:** https://platform.composio.dev/

---

## 🎯 Recomendação

Para **testar rapidamente**, use a **Opção 2** (criar auth configs manualmente).

Para **produção**, recomendo a **Opção 3** (refatorar para Tool Router puro).

---

## 🔍 Por que o código atual não funciona?

O código em `AppsPageWithAuth.tsx` (linhas 128-131) filtra apenas auth configs que contêm "toolrouter" no nome:

```typescript
const toolRouterConfigs = authConfigsData.items.filter(config => 
  config.name && config.name.toLowerCase().includes('toolrouter')
);
```

Se você não tiver auth configs com esse padrão de nome no Composio, nenhum app será exibido.

---

## 🔐 Configurando Apps com OAuth Customizado (Google Admin, etc.)

### ⚠️ IMPORTANTE: A Maioria dos Apps NÃO Precisa Disso!

**~90% dos apps funcionam automaticamente** com as credenciais padrão do Composio. Você só precisa clicar em "Connect" e autorizar.

**Apps que funcionam direto (sem configuração):**
- ✅ Gmail, Google Calendar, Google Drive
- ✅ Slack, Discord, Microsoft Teams
- ✅ GitHub, GitLab, Bitbucket
- ✅ Notion, Trello, Asana, Linear
- ✅ Dropbox, OneDrive
- ✅ Twitter/X, LinkedIn
- ✅ E centenas de outros...

**Apenas ~10% dos apps precisam de OAuth customizado** - especialmente aqueles com privilégios administrativos elevados como **Google Admin**.

### 🎯 Como Saber se Precisa Configurar?

**Simples:** Tente conectar o app primeiro!

- ✅ **Se funcionar direto** → Ótimo! Não precisa fazer nada
- ⚠️ **Se aparecer "Additional OAuth credentials required"** → Aí sim, siga este guia

---

Alguns apps, especialmente aqueles com privilégios elevados como **Google Admin**, requerem credenciais OAuth customizadas (`client_id` e `client_secret`).

### 📋 Por que isso é necessário?

- **Segurança**: Apps com acesso administrativo (como Google Admin) precisam de credenciais OAuth específicas da sua organização
- **Compliance**: Garante que apenas administradores autorizados possam configurar essas integrações
- **Controle**: Permite que sua organização gerencie e revogue acessos conforme necessário

### 🎯 Apps que Requerem OAuth Customizado

- **Google Admin** (Super Admin)
- **Google Workspace** (Admin)
- **Microsoft 365 Admin**
- **Salesforce** (dependendo do nível de acesso)
- Outros apps enterprise com privilégios administrativos

---

## 📝 Como Configurar Google Admin OAuth

### **Passo 1: Criar Projeto no Google Cloud Console**

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Nome sugerido: `Rube-Google-Admin-Integration`

### **Passo 2: Habilitar APIs Necessárias**

1. No menu lateral, vá para **APIs & Services** > **Library**
2. Busque e habilite as seguintes APIs:
   - **Admin SDK API**
   - **Google Workspace Admin API**
   - **Directory API**

### **Passo 3: Configurar OAuth Consent Screen**

1. Vá para **APIs & Services** > **OAuth consent screen**
2. Selecione **Internal** (se for Google Workspace) ou **External**
3. Preencha as informações:
   - **App name**: `Rube Integration`
   - **User support email**: seu email
   - **Developer contact**: seu email
4. Clique em **Save and Continue**
5. Em **Scopes**, adicione os escopos necessários:
   - `https://www.googleapis.com/auth/admin.directory.user`
   - `https://www.googleapis.com/auth/admin.directory.group`
   - `https://www.googleapis.com/auth/admin.directory.orgunit`
6. Clique em **Save and Continue**

### **Passo 4: Criar Credenciais OAuth**

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Tipo de aplicativo: **Web application**
4. Nome: `Rube-Composio-Integration`
5. **Authorized redirect URIs**, adicione:
   ```
   https://backend.composio.dev/api/v3/toolkits/auth/callback
   ```
6. Clique em **CREATE**
7. **IMPORTANTE**: Copie e salve em local seguro:
   - ✅ **Client ID** (algo como: `123456789-abc.apps.googleusercontent.com`)
   - ✅ **Client Secret** (algo como: `GOCSPX-abc123xyz`)

### **Passo 5: Configurar no Composio Dashboard**

1. Acesse: https://platform.composio.dev/
2. Faça login com sua conta Composio
3. No menu lateral, vá para **Authentication Management**
4. Clique em **Create Auth Config**
5. Preencha:
   - **Toolkit**: Selecione `googleadmin` ou `google_admin`
   - **Name**: `googleadmin-toolrouter-config` (⚠️ importante ter "toolrouter" no nome!)
   - **Authentication Type**: OAuth2
   - **Client ID**: Cole o Client ID do Google Cloud Console
   - **Client Secret**: Cole o Client Secret do Google Cloud Console
6. Clique em **Save**

### **Passo 6: Conectar Conta no Rube**

Agora você pode conectar sua conta Google Admin no Rube:

1. Abra o Rube: http://localhost:3002
2. Vá para a aba **Apps**
3. Procure por **Google Admin**
4. Clique em **Connect**
5. Siga o fluxo de autenticação OAuth
6. Autorize as permissões solicitadas
7. ✅ Pronto! Sua conta está conectada

---

## 🔧 Solução de Problemas

### ❌ Erro: "Additional OAuth credentials required"

**Causa**: O app requer credenciais OAuth customizadas que não foram configuradas.

**Solução**: Siga os passos acima para criar e configurar as credenciais OAuth no Google Cloud Console e Composio Dashboard.

### ❌ Erro: "Redirect URI mismatch"

**Causa**: A URI de redirecionamento não está configurada corretamente no Google Cloud Console.

**Solução**: 
1. Vá para Google Cloud Console > Credentials
2. Edite o OAuth Client ID
3. Adicione exatamente: `https://backend.composio.dev/api/v3/toolkits/auth/callback`

### ❌ Erro: "Access denied"

**Causa**: Sua conta não tem privilégios de Super Admin no Google Workspace.

**Solução**: 
1. Certifique-se de que você é Super Admin no Google Workspace
2. Ou peça para um Super Admin conectar a conta

### ❌ Apps não aparecem na lista

**Causa**: Auth configs não foram criadas com o padrão de nome correto.

**Solução**: 
1. Certifique-se de que o nome da auth config contém "toolrouter"
2. Exemplo correto: `googleadmin-toolrouter-config`
3. Exemplo incorreto: `google-admin-config`

---

## 📚 Recursos Adicionais

### Documentação Oficial

- **Composio Auth Config**: https://docs.composio.dev/guides/authentication/auth-config
- **Google Cloud OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Google Admin SDK**: https://developers.google.com/admin-sdk

### Vídeos Tutoriais

- **Composio Authentication**: https://www.youtube.com/composio
- **Google Cloud OAuth Setup**: https://www.youtube.com/googlecloud

---

## 🎯 Checklist de Configuração

Use este checklist para garantir que tudo está configurado corretamente:

- [ ] Projeto criado no Google Cloud Console
- [ ] APIs habilitadas (Admin SDK, Directory API)
- [ ] OAuth Consent Screen configurado
- [ ] Credenciais OAuth criadas
- [ ] Client ID e Client Secret copiados
- [ ] Redirect URI configurada corretamente
- [ ] Auth Config criada no Composio Dashboard
- [ ] Nome da Auth Config contém "toolrouter"
- [ ] Conta conectada no Rube
- [ ] Testado com uma ação simples (ex: listar usuários)

---

**Precisa de ajuda para implementar alguma dessas opções? Me avise!** 🚀
