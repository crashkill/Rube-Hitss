# Product Requirements Document (PRD) - Open Rube

## Visão Geral e Problema
**Visão:** Criar uma versão open-source ("Open Rube") que seja funcionalmente e esteticamente equivalente à versão comercial do Rube (rube.app).
**Problema:** A versão atual (local) pode ter lacunas de funcionalidade, UX ou design em comparação com a versão comercial, que atua como um servidor MCP robusto com integrações profundas.
**Objetivo:** Analisar e implementar funcionalidades para garantir paridade com o Rube comercial, focando em capacidades de agente, integração de ferramentas (MCP) e experiência do usuário.

## Público-Alvo
- Desenvolvedores que desejam um assistente de IA local com capacidades de execução real.
- Equipes que precisam de automação de fluxo de trabalho via chat.
- Usuários do Composio que buscam uma interface web customizável.

## Funcionalidades Principais
1.  **Interface de Chat com IA:** Suporte a GPT-4/GPT-5 e **Ollama (Self-Hosted)** com streaming em tempo real.
2.  **Tool Router (Composio):** Descoberta e execução automática de ferramentas para 500+ apps.
3.  **Protocolo MCP:** Suporte completo ao Model Context Protocol para integração com clientes e ferramentas.
4.  **Gerenciamento de Autenticação:** Conexão OAuth segura via Supabase e Composio.
5.  **Histórico e Persistência:** Salvamento de conversas e contexto.
6.  **Gerenciamento de Apps:** Interface para conectar/desconectar integrações (Gmail, Slack, GitHub, etc.).

## Fluxo de Usuário
1.  **Onboarding:** Login/Cadastro via Supabase.
2.  **Conexão de Apps:** Usuário acessa aba de Apps e conecta ferramentas (ex: GitHub).
3.  **Interação:** Usuário envia comando no chat (ex: "Crie uma issue no repo X").
4.  **Processamento:**
    - Tool Router identifica a ferramenta.
    - Verifica autenticação.
    - Executa ação via API.
5.  **Feedback:** Resultado é exibido no chat (sucesso/erro/dados).

## Critérios de Sucesso
- Paridade de funcionalidades principais com rube.app.
- Execução bem-sucedida de ações em apps conectados.
- Interface responsiva e esteticamente agradável ("Premium Design").
- Documentação completa e atualizada.

## Riscos e Mitigação
- **Risco:** Complexidade de manter 500+ integrações.
    - *Mitigação:* Uso do SDK do Composio para abstrair integrações.
- **Risco:** Segurança de tokens.
    - *Mitigação:* Tokens gerenciados pelo Composio/Supabase, nunca expostos no frontend.
- **Risco:** Divergência da API do Composio.
    - *Mitigação:* Manter dependências atualizadas e monitorar changelogs.

## Arquitetura de Componentes
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend:** Next.js API Routes (Serverless).
- **Banco de Dados:** Supabase Imperial (Self-Hosted via Coolify).
- **Auth:** Supabase Auth (Imperial - SSR).
- **IA/Agente:** Vercel AI SDK + OpenAI / Ollama (Self-Hosted).
- **Integração:** Composio SDK + MCP.
- **Infraestrutura:** Coolify (Nixpacks).

## Stack Sugerida
- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase (Self-Hosted)
- Composio SDK
- Vercel AI SDK
- Ollama (LLM Local/Privado)
- Coolify

## Roadmap
- [x] Configuração Inicial e Documentação (PRD/README).
- [x] Análise de Lacunas (Local vs Comercial).
- [x] Migração para Supabase Imperial.
- [x] Implementação de Receitas (CRUD + Chat Integration).
- [x] Deploy Automatizado via Coolify.
- [ ] Implementação de Melhorias de UI/UX.
- [ ] Refinamento do Tool Router e MCP.
- [ ] Testes e Validação Contínua.
