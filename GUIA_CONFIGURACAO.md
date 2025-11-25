# 🚀 Guia de Configuração - Open Rube

## ✅ Status da Instalação

- [x] Repositório clonado com sucesso
- [x] Dependências instaladas (531 pacotes)
- [x] Arquivo `.env.local` criado

---

## 📋 Próximos Passos para Configuração

### 1️⃣ Obter API Keys Necessárias

Você precisará criar contas e obter chaves de API dos seguintes serviços:

#### **A. Composio** (Obrigatório)
- 🔗 Acesse: [https://composio.dev](https://composio.dev)
- Crie uma conta gratuita
- Vá para **Settings** → **API Keys**
- Copie sua **API Key**
- Cole no arquivo `.env.local` na variável `COMPOSIO_API_KEY`

#### **B. OpenAI** (Obrigatório)
- 🔗 Acesse: [https://platform.openai.com](https://platform.openai.com)
- Crie uma conta ou faça login
- Vá para **API Keys** no menu lateral
- Clique em **Create new secret key**
- Copie a chave (ela só será mostrada uma vez!)
- Cole no arquivo `.env.local` na variável `OPENAI_API_KEY`
- ⚠️ **Importante**: Você precisará adicionar créditos na sua conta OpenAI

#### **C. Supabase** (Obrigatório)
- 🔗 Acesse: [https://supabase.com](https://supabase.com)
- Crie uma conta gratuita
- Clique em **New Project**
- Preencha os dados:
  - **Name**: `open-rube` (ou qualquer nome)
  - **Database Password**: Escolha uma senha forte
  - **Region**: Escolha a região mais próxima (ex: South America)
- Aguarde a criação do projeto (pode levar alguns minutos)

Após criar o projeto:
1. Vá para **Settings** → **API**
2. Copie o **Project URL** → Cole em `NEXT_PUBLIC_SUPABASE_URL`
3. Copie o **anon public** key → Cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 2️⃣ Configurar o Banco de Dados Supabase

Você precisa criar as tabelas necessárias no Supabase:

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Cole o seguinte SQL:

```sql
-- Tabela de conversas
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de segurança para messages
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );
```

4. Clique em **Run** para executar o script

---

### 3️⃣ Configurar Autenticação no Supabase

1. No painel do Supabase, vá para **Authentication** → **Providers**
2. Habilite **Email** (já deve estar habilitado por padrão)
3. **Opcional**: Habilite **Google OAuth**:
   - Ative o toggle do Google
   - Você precisará criar um projeto no Google Cloud Console
   - Obter Client ID e Client Secret
   - Configurar URLs de redirecionamento

4. Configure **Redirect URLs**:
   - Vá para **Authentication** → **URL Configuration**
   - Adicione: `http://localhost:3000/auth/callback`
   - Para produção, adicione também: `https://seu-dominio.com/auth/callback`

---

### 4️⃣ Verificar o Arquivo .env.local

Abra o arquivo `.env.local` e preencha todas as variáveis:

```env
# COMPOSIO
COMPOSIO_API_KEY=comp_xxxxxxxxxxxxxxxxxx

# OPENAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxx

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# APP
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 5️⃣ Executar o Projeto

Após configurar tudo, execute:

```bash
npm run dev
```

O projeto estará disponível em: **http://localhost:3000**

---

## 🎯 Como Usar

1. **Acesse** `http://localhost:3000`
2. **Crie uma conta** ou faça login
3. **Vá para a aba "Apps"** e conecte os aplicativos que deseja usar
4. **Volte para o Chat** e comece a interagir com a IA
5. **Peça para a IA executar ações** nos seus apps conectados!

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar em produção
npm start

# Verificar erros de lint
npm run lint
```

---

## 📚 Estrutura do Projeto

```
open-rube/
├── app/
│   ├── api/                    # Rotas da API
│   │   ├── chat/              # Endpoint de chat com Tool Router
│   │   ├── authConfig/        # Configuração de auth do Composio
│   │   ├── authLinks/         # Gerenciamento de conexão de apps
│   │   ├── connectedAccounts/ # Apps conectados do usuário
│   │   └── conversations/     # Histórico de conversas
│   ├── components/            # Componentes React
│   ├── utils/                 # Funções utilitárias
│   ├── hooks/                 # React Hooks customizados
│   ├── auth/                  # Páginas de autenticação
│   ├── apps/                  # Página de gerenciamento de apps
│   └── page.tsx              # Página principal (chat)
├── public/                    # Assets estáticos
├── .env.local                # Variáveis de ambiente (NÃO COMMITAR!)
└── package.json
```

---

## 🐛 Troubleshooting

### Erro: "Invalid API Key"
- Verifique se copiou as chaves corretamente
- Certifique-se de que não há espaços extras
- Verifique se as chaves estão ativas nas respectivas plataformas

### Erro: "Database connection failed"
- Verifique se o projeto Supabase está ativo
- Confirme se executou o script SQL de criação de tabelas
- Verifique se as URLs e chaves do Supabase estão corretas

### Erro: "Authentication failed"
- Verifique se configurou os provedores de autenticação no Supabase
- Confirme se as URLs de redirecionamento estão corretas

### Porta 3000 já em uso
```bash
# Use outra porta
PORT=3001 npm run dev
```

---

## 💡 Dicas

- **Custos**: OpenAI cobra por uso. Monitore seu consumo em [platform.openai.com](https://platform.openai.com)
- **Segurança**: NUNCA commite o arquivo `.env.local` no Git
- **Produção**: Para deploy, use serviços como Vercel, Netlify ou Railway
- **Composio**: Explore as 500+ integrações disponíveis em [composio.dev](https://composio.dev)

---

## 📞 Suporte

- **Documentação Composio**: [docs.composio.dev](https://docs.composio.dev)
- **Documentação Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Documentação Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: [github.com/ComposioHQ/open-rube/issues](https://github.com/ComposioHQ/open-rube/issues)

---

## ✨ Recursos Avançados

### Personalizar Modelos de IA
Edite `app/api/chat/route.ts` para mudar o modelo:
```typescript
model: openai('gpt-4-turbo') // ou 'gpt-3.5-turbo' para economizar
```

### Limitar Toolkits Disponíveis
Edite `app/api/chat/route.ts`:
```typescript
toolkits: ['github', 'slack', 'gmail'] // Apenas esses apps
```

---

**Bom desenvolvimento! 🚀**
