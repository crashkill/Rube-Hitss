# 🤖 Rube-Hitss

Uma implementação open-source do [Rube](https://rube.app) construída com [Composio](https://composio.dev?utm_source=github&utm_medium=readme&utm_campaign=rube-hitss), capacitando agentes de IA a interagir com mais de 500 aplicações diretamente na interface de chat.

![Rube-Hitss Demo](public/open-rube.gif)

---

## 📋 Índice

- [O que é o Rube-Hitss?](#-o-que-é-o-rube-hitss)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Arquitetura Técnica](#-arquitetura-técnica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Documentação Adicional](#-documentação-adicional)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 O que é o Rube-Hitss?

O Rube-Hitss transforma assistentes de IA de conselheiros passivos em executores ativos. Em vez de apenas sugerir ações, a IA pode **realmente executá-las** em centenas de aplicações, incluindo:

- 💬 **Comunicação**: Slack, Microsoft Teams, Discord, Telegram
- 📝 **Produtividade**: Notion, Google Docs, Confluence, Trello
- 💻 **Desenvolvimento**: GitHub, GitLab, Jira, Linear
- 📅 **Calendário**: Google Calendar, Outlook Calendar
- 📧 **Email**: Gmail, Outlook
- 💼 **CRM/Vendas**: HubSpot, Salesforce, Pipedrive
- 🎨 **Design**: Figma, Canva
- E muito mais...

### Como Funciona?

Construído sobre o framework [Composio](https://composio.dev), o Rube-Hitss automatiza:

1. **🔐 Autenticação** - Conecta-se perfeitamente aos seus aplicativos via OAuth, API keys e outros métodos
2. **🔍 Descoberta de Ferramentas** - Identifica inteligentemente as ferramentas certas para qualquer tarefa
3. **⚡ Execução** - Realiza ações em múltiplas aplicações em paralelo
4. **🔄 Orquestração de Workflows** - Encadeia operações complexas multi-etapas através de diferentes plataformas

---

## ✨ Funcionalidades Principais

### Interface e Experiência do Usuário

- **💬 Interface de Chat com IA** - Interação em linguagem natural powered by OpenAI GPT-4
- **🌓 Modo Escuro/Claro** - Temas personalizáveis com persistência de preferências
- **🌐 Multi-idioma** - Suporte para Português e Inglês
- **📱 Design Responsivo** - Funciona perfeitamente em desktop, tablet e mobile

### Integrações e Ferramentas

- **🔌 500+ Integrações** - Conecte-se virtualmente a qualquer aplicação empresarial popular
- **🔒 Autenticação Segura** - Autenticação de usuário via Supabase com conexões de app por usuário
- **🔀 Tool Router Inteligente** - Descoberta e execução automática de ferramentas via Tool Router experimental do Composio
- **⚙️ Gerenciamento de Conexões OAuth** - Modal intuitivo para configuração de credenciais OAuth personalizadas

### Gerenciamento de Conversas

- **💾 Histórico Persistente** - Armazenamento de conversas e mensagens no Supabase
- **🔄 Streaming em Tempo Real** - Respostas da IA ao vivo com visibilidade de execução de ferramentas
- **📂 Organização de Chats** - Criação, edição e exclusão de conversas
- **🔍 Busca de Conversas** - Encontre rapidamente conversas anteriores

### Gerenciamento de Apps

- **➕ Conectar Apps** - Interface amigável para conectar e desconectar aplicações
- **🔄 Sincronização Automática** - Verificação de status de conexão em tempo real
- **⏳ Wait For Connection** - Sistema inteligente que aguarda conexões INITIATED se tornarem ACTIVE
- **🔑 Configuração OAuth Customizada** - Suporte para aplicações privilegiadas com suas próprias credenciais OAuth

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: Next.js 15.5.4 com React 19.1.0
- **Linguagem**: TypeScript 5
- **Estilização**: Tailwind CSS 4 com sistema de design customizado
- **Tipografia**: @tailwindcss/typography para formatação de conteúdo Markdown

#### Backend
- **Runtime**: Next.js API Routes (serverless)
- **Database**: PostgreSQL via Supabase
- **Autenticação**: Supabase Auth com suporte a múltiplos providers (Google, Email, etc.)
- **ORM**: Supabase Client

#### IA e Integrações
- **Framework de IA**: Vercel AI SDK 5.0.86 com suporte a streaming
- **Modelo**: OpenAI GPT-4 (configurável)
- **Plataforma de Integrações**: Composio 0.2.14
- **Protocolo**: MCP (Model Context Protocol) 1.18.2

### Componentes da Arquitetura

#### 1. **Tool Router** 🧠

O Tool Router experimental do Composio é o cérebro do Rube-Hitss:

```typescript
// Tool Router cria sessões MCP por usuário
const mcpSession = await composio.experimental.toolRouter.createSession(userEmail, {
  toolkits: [] // Array vazio permite todas as ferramentas disponíveis
});
```

**Funcionalidades**:
- Descobre ferramentas relevantes de 500+ integrações baseado na intenção do usuário
- Gerencia fluxos de autenticação automaticamente
- Executa ferramentas em paralelo quando possível
- Lida com erros e retentativas de forma inteligente
- Suporta streaming de resultados em tempo real

#### 2. **Model Context Protocol (MCP)** 🔗

O MCP facilita a comunicação entre o modelo de IA e as ferramentas Composio:

- **Protocolo Padronizado**: Para descoberta e execução de ferramentas
- **Transporte HTTP Streaming**: Para atualizações em tempo real
- **Arquitetura Baseada em Sessões**: Para manter o contexto
- **Descoberta Dinâmica de Ferramentas**: Ferramentas são carregadas sob demanda

#### 3. **Fluxo de Trabalho do Agente de IA** 🔄

```
📝 Entrada do Usuário 
    ↓
🤖 GPT-4 Processa Intenção
    ↓
🔍 Tool Router → Descoberta de Ferramentas
    ↓
🔐 Verificação de Autenticação
    ↓
⏳ Wait For Connection (se INITIATED)
    ↓
⚡ Execução de Ferramentas
    ↓
📊 Processamento de Resultados
    ↓
💬 Resposta da IA
    ↓
👤 Usuário
```

#### 4. **Schema do Banco de Dados** 🗄️

**Tabela: auth.users** (Gerenciado pelo Supabase Auth)
- Informações de autenticação do usuário
- Metadata e perfis

**Tabela: conversations**
```sql
- id (UUID, PK)
- user_id (UUID, FK -> auth.users)
- title (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Tabela: messages**
```sql
- id (UUID, PK)
- conversation_id (UUID, FK -> conversations)
- role (TEXT) -- 'user', 'assistant', 'system'
- content (TEXT)
- created_at (TIMESTAMP)
```

**Integração com Composio**:
- Connected Accounts são gerenciados internamente pelo Composio
- Acessados via API do Composio associada ao email do usuário

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter:

### Software Necessário

- **Node.js**: Versão 20.x ou superior ([Download](https://nodejs.org/))
- **npm/yarn/pnpm**: Gerenciador de pacotes (npm vem com Node.js)
- **Git**: Para controle de versão ([Download](https://git-scm.com/))

### Contas e Chaves de API

1. **Composio** 🔧
   - Crie uma conta em [composio.dev](https://composio.dev)
   - Obtenha sua API key no dashboard
   - Configure o callback URL: `http://localhost:3000` (desenvolvimento)

2. **Supabase** 🗄️
   - Crie um projeto em [supabase.com](https://supabase.com)
   - Obtenha a URL do projeto e a chave anon pública
   - Configure autenticação (Google OAuth recomendado)

3. **OpenAI** 🤖
   - Crie uma conta em [platform.openai.com](https://platform.openai.com)
   - Obtenha sua API key
   - Garanta que tem créditos disponíveis

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/YOUR_USERNAME/Rube-Hitss.git
cd Rube-Hitss
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# ============================================
# COMPOSIO - Plataforma de Integrações
# ============================================
COMPOSIO_API_KEY=sua_chave_api_composio_aqui

# ============================================
# OPENAI - Modelo de IA
# ============================================
OPENAI_API_KEY=sua_chave_api_openai_aqui

# ============================================
# SUPABASE - Banco de Dados e Autenticação
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase

# ============================================
# APLICAÇÃO
# ============================================
# URL base da aplicação (mude em produção)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configure o Supabase

#### 2.1. Execute o Script SQL

No SQL Editor do seu projeto Supabase, execute o arquivo `supabase-setup.sql`:

```sql
-- Tabela de conversas
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de mensagens
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices para performance
create index messages_conversation_id_idx on messages(conversation_id);
create index conversations_user_id_idx on conversations(user_id);

-- RLS (Row Level Security)
alter table conversations enable row level security;
alter table messages enable row level security;

-- Políticas RLS para conversations
create policy "Users can view their own conversations"
  on conversations for select
  using (auth.uid() = user_id);

create policy "Users can create their own conversations"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on conversations for delete
  using (auth.uid() = user_id);

-- Políticas RLS para messages
create policy "Users can view messages from their conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can create messages in their conversations"
  on messages for insert
  with check (
    exists (
      select 1 from conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );
```

#### 2.2. Configure a Autenticação

No painel do Supabase:

1. Vá para **Authentication** → **Providers**
2. Ative **Google** (recomendado):
   - Obtenha Client ID e Client Secret do [Google Cloud Console](https://console.cloud.google.com)
   - Configure a URL de redirecionamento: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
3. Configure URLs permitidas em **URL Configuration**:
   - Site URL: `http://localhost:3000` (desenvolvimento)
   - Redirect URLs: `http://localhost:3000/**`

### 3. Configure o Composio

1. Acesse [app.composio.dev](https://app.composio.dev)
2. Vá para **Settings** → **API Keys**
3. Copie sua API key
4. Configure o redirect URL do seu app:
   - Development: `http://localhost:3000`
   - Production: `https://seu-dominio.com`

---

## 🎮 Uso

### Modo Desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Primeiro Acesso

1. **📝 Criar Conta**
   - Clique em "Sign Up"
   - Use Google OAuth ou crie conta com email/senha

2. **🔌 Conectar Aplicações**
   - Vá para a aba "Apps"
   - Clique em "Connect" nos apps que deseja integrar
   - Complete o fluxo OAuth de cada aplicação

3. **💬 Começar a Conversar**
   - Crie uma nova conversa
   - Digite comandos em linguagem natural
   - Veja a IA executar ações nos seus apps!

### Exemplos de Comandos

```
📧 "Envie um email para joao@example.com com o assunto 'Reunião' dizendo que confirmo presença"

📅 "Crie um evento no meu Google Calendar para amanhã às 14h chamado 'Reunião de Planejamento'"

💬 "Envie uma mensagem no Slack no canal #geral dizendo 'Deploy concluído com sucesso'"

📝 "Crie uma página no Notion chamada 'Roadmap Q1' com uma lista de tarefas"

💻 "Crie uma issue no GitHub no repositório 'projeto-x' com o título 'Bug: erro no login'"

🔍 "Liste todos os meus eventos do Google Calendar da próxima semana"
```

### Build de Produção

```bash
# Criar build otimizado
npm run build

# Iniciar servidor de produção
npm start
```

---

## 📁 Estrutura do Projeto

```
Rube-Hitss/
├── 📂 app/
│   ├── 📂 api/                          # API Routes (Backend)
│   │   ├── 📂 chat/                     # Endpoint principal de chat
│   │   │   └── route.ts                 # Streaming com Tool Router
│   │   ├── 📂 apps/
│   │   │   └── 📂 connection/
│   │   │       ├── 📂 initiate/         # Iniciar conexão OAuth
│   │   │       │   └── route.ts
│   │   │       └── 📂 wait/             # Aguardar conexão ACTIVE
│   │   │           └── route.ts
│   │   ├── 📂 auth/
│   │   │   ├── 📂 callback/             # Callback OAuth
│   │   │   │   └── route.ts
│   │   │   └── 📂 signout/              # Logout
│   │   │       └── route.ts
│   │   ├── 📂 authConfig/               # Config OAuth Composio
│   │   │   └── route.ts
│   │   ├── 📂 authLinks/                # Links de autenticação
│   │   │   └── route.ts
│   │   ├── 📂 connectedAccounts/        # Apps conectados
│   │   │   └── route.ts
│   │   └── 📂 conversations/            # CRUD de conversas
│   │       └── route.ts
│   ├── 📂 components/                   # Componentes React
│   │   ├── AppsPageToolRouter.tsx       # Página de gerenciamento de apps
│   │   ├── ChatContainer.tsx            # Container principal do chat
│   │   ├── ChatPageWithAuth.tsx         # Página de chat com auth
│   │   ├── MessageInput.tsx             # Input de mensagens
│   │   ├── Sidebar.tsx                  # Barra lateral de navegação
│   │   ├── ToolCallDisplay.tsx          # Display de chamadas de ferramentas
│   │   └── UserMenu.tsx                 # Menu do usuário
│   ├── 📂 utils/                        # Utilitários
│   │   ├── 📂 supabase/
│   │   │   ├── client.ts                # Cliente Supabase (browser)
│   │   │   └── server.ts                # Cliente Supabase (server)
│   │   ├── chat-history.ts              # Operações de histórico
│   │   └── composio.ts                  # Cliente Composio
│   ├── 📂 auth/                         # Páginas de autenticação
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css                      # Estilos globais
│   ├── layout.tsx                       # Layout principal
│   └── page.tsx                         # Home page
├── 📂 public/                           # Assets estáticos
│   ├── open-rube.gif
│   └── [outros assets]
├── 📂 node_modules/                     # Dependências
├── 📄 .env.local                        # Variáveis de ambiente (não commitado)
├── 📄 .gitignore                        # Arquivos ignorados pelo Git
├── 📄 eslint.config.mjs                 # Configuração ESLint
├── 📄 middleware.ts                     # Middleware Next.js (auth)
├── 📄 next-env.d.ts                     # Types do Next.js
├── 📄 next.config.ts                    # Configuração Next.js
├── 📄 package.json                      # Dependências e scripts
├── 📄 postcss.config.mjs                # Configuração PostCSS
├── 📄 README.md                         # Documentação (EN)
├── 📄 README.pt-BR.md                   # Documentação (PT-BR)
├── 📄 supabase-setup.sql                # Script de setup do DB
├── 📄 tailwind.config.js                # Configuração Tailwind
├── 📄 tsconfig.json                     # Configuração TypeScript
└── 📂 Documentação/
    ├── INICIO_RAPIDO.md                 # Guia de início rápido
    ├── GUIA_CONFIGURACAO.md             # Guia detalhado de configuração
    ├── COMO_CONFIGURAR_APPS.md          # Como configurar apps específicos
    ├── OAUTH_POPUP_IMPLEMENTATION.md    # Implementação do popup OAuth
    └── IMPLEMENTACAO_FINAL.md           # Documentação da implementação
```

---

## 🛠️ Tecnologias Utilizadas

### Core
- **[Next.js 15](https://nextjs.org/)** - Framework React com Server Components
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript 5](https://www.typescriptlang.org/)** - Tipagem estática

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin)** - Formatação de prosa

### Backend & Database
- **[Supabase](https://supabase.com/)** - Backend as a Service (PostgreSQL + Auth)
- **[@supabase/ssr](https://supabase.com/docs/guides/auth/server-side)** - SSR para Next.js

### IA & Integrações
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - Framework para aplicações de IA
- **[OpenAI](https://openai.com/)** - Modelos de linguagem (GPT-4)
- **[Composio](https://composio.dev/)** - Plataforma de integrações para agentes de IA
- **[MCP](https://modelcontextprotocol.io/)** - Model Context Protocol

### Markdown & UI
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Renderização de Markdown
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown

### DevTools
- **[ESLint](https://eslint.org/)** - Linting de código
- **[PostCSS](https://postcss.org/)** - Transformação de CSS

---

## 📚 Documentação Adicional

Este projeto inclui documentação detalhada em português:

- **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guia de início rápido para começar em minutos
- **[GUIA_CONFIGURACAO.md](./GUIA_CONFIGURACAO.md)** - Guia detalhado de configuração passo a passo
- **[COMO_CONFIGURAR_APPS.md](./COMO_CONFIGURAR_APPS.md)** - Como configurar aplicações específicas (Gmail, Slack, etc.)
- **[OAUTH_POPUP_IMPLEMENTATION.md](./OAUTH_POPUP_IMPLEMENTATION.md)** - Detalhes da implementação do modal OAuth
- **[IMPLEMENTACAO_FINAL.md](./IMPLEMENTACAO_FINAL.md)** - Documentação técnica da implementação final

### Recursos Externos

#### Composio
- [Site Oficial](https://composio.dev)
- [Documentação](https://docs.composio.dev)
- [Repositório GitHub](https://github.com/composiohq/composio)
- [Tool Router Quick Start](https://docs.composio.dev/docs/tool-router/quick-start)

#### Next.js & React
- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação React](https://react.dev/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

#### Supabase
- [Documentação](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

#### Outros
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Aqui está como você pode ajudar:

### Como Contribuir

1. **Fork o Projeto**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Crie uma Branch de Feature**
   ```bash
   git checkout -b feature/MinhaNovaFuncionalidade
   ```

3. **Faça Commit das Mudanças**
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade incrível'
   ```

4. **Push para a Branch**
   ```bash
   git push origin feature/MinhaNovaFuncionalidade
   ```

5. **Abra um Pull Request**
   - Descreva suas mudanças detalhadamente
   - Referencie issues relacionadas

### Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação, ponto e vírgula faltando, etc.
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Tarefas de manutenção

### Áreas para Contribuir

- 🐛 Reportar bugs
- 💡 Sugerir novas funcionalidades
- 📝 Melhorar documentação
- 🌐 Adicionar traduções
- 🎨 Melhorar UI/UX
- ⚡ Otimizar performance
- 🧪 Adicionar testes

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE.md](./LICENSE.md) para mais detalhes.

```
MIT License

Copyright (c) 2025 HITSS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Agradecimentos

- **[Composio](https://composio.dev)** - A camada de habilidades para agentes de IA
- **[Rube](https://rube.app)** - Inspiração para este projeto
- **OpenAI** - Pelos poderosos modelos de linguagem
- **Supabase** - Backend e autenticação simplificados
- **Vercel** - Pelo excelente AI SDK e hospedagem
- **HITSS** - Pelo suporte e recursos para desenvolvimento

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:

- 📧 **Email**: suporte@hitss.com.br
- 💬 **GitHub Issues**: [Abrir Issue](https://github.com/YOUR_USERNAME/Rube-Hitss/issues)
- 📚 **Documentação**: Veja os arquivos `.md` incluídos no projeto

---

## 🚀 Roadmap

### Em Desenvolvimento
- [ ] Suporte a mais provedores de IA (Claude, Gemini)
- [ ] Interface para criação de workflows personalizados
- [ ] Dashboard de analytics de uso
- [ ] Modo offline com sincronização

### Futuro
- [ ] Aplicativo mobile (React Native)
- [ ] Extensão para navegadores
- [ ] API pública para desenvolvedores
- [ ] Marketplace de workflows da comunidade

---

<div align="center">

**Desenvolvido com ❤️ pela equipe HITSS**

⭐ Se este projeto te ajudou, considere dar uma estrela!

[Reportar Bug](https://github.com/YOUR_USERNAME/Rube-Hitss/issues) · [Solicitar Feature](https://github.com/YOUR_USERNAME/Rube-Hitss/issues) · [Documentação](./GUIA_CONFIGURACAO.md)

</div>
