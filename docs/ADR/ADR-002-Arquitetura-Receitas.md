# ADR-002: Arquitetura do Sistema de Receitas

**Date:** 2026-01-06
**Status:** Accepted

## Context
A aplicação Rube necessita de um sistema para gerenciar "Receitas" (prompts pré-definidos que orquestram ferramentas). As receitas precisam ser dinâmicas, categorizáveis e vinculadas a aplicações específicas (Composio apps). O sistema deve permitir CRUD seguro e execução imediata no chat.

## Decision
Decidimos implementar o módulo de Receitas utilizando uma tabela `recipes` no Supabase com suporte a tipos complexos via JSONB para flexibilidade futura.

**Design Técnico:**
- **Tabela:** `recipes` (id, title, description, prompt_template, category, apps[], is_active).
- **Soft Delete:** Coluna `is_active` (boolean) em vez de exclusão física para preservação de histórico.
- **Integração Frontend:** `LibraryPage` consome API `/api/recipes` que encapsula a lógica de banco (Server-Side).
- **Execução:** O botão "Try" redireciona para o chat preenchendo o input com o template da receita.

## Consequences
**Positivas:**
- Separação clara entre dados de receitas e lógica de execução.
- Soft delete previne perda acidental de prompts valiosos.
- Estrutura de array para `apps` permite receitas multi-ferramentas.

**Negativas/Riscos:**
- A dependência de JSON para estrutura de apps requer validação rigorosa no frontend/API para evitar dados inconsistentes.
- Necessidade de manter a API `/api/recipes` sincronizada com o schema do banco.

## Notes
A implementação inicial (MVP) já suporta listagem, deleção (soft) e execução no chat.
