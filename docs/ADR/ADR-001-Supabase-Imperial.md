# ADR-001: Migração para Supabase Imperial (Self-Hosted)

**Date:** 2026-01-06
**Status:** Accepted

## Context
O projeto Rube-Local necessita de uma camada de dados robusta, com suporte a autenticação, banco de dados relacional e tempo real. Inicialmente, poder-se-ia considerar o uso do Supabase Cloud (SaaS). No entanto, sob a doutrina Imperial de soberania de dados e eliminação de vendor lock-in, é imperativo que a infraestrutura esteja sob controle total da organização.

## Decision
Decidimos migrar e hospedar a instância do Supabase ("Imperial Supabase") dentro de nossa própria infraestrutura gerenciada pelo Coolify.

**Detalhes da Decisão:**
- **Infraestrutura:** Servidor VPS gerenciado via Coolify.
- **Domínio:** `supabase.fsw-hitss.duckdns.org`.
- **Segurança:** Chaves `anon` e `service_role` gerenciadas internamente; SSL via Let's Encrypt.
- **Acesso:** Restrito via variáveis de ambiente.

## Consequences
**Positivas:**
- Controle total sobre os dados.
- Custo fixo de infraestrutura (VPS) independente do volume de uso (até o limite do hardware).
- Sem limites de "Pro Plan" impostos por SaaS.
- Alinhamento com a diretriz de "Ordem e Disciplina" do projeto.

**Negativas/Riscos:**
- Responsabilidade total por backups e manutenção.
- Necessidade de gerenciar atualizações do Supabase Docker images manuamente.
- Complexidade inicial de configuração (vencida na fase de setup).

## Notes
A migração foi concluída com sucesso e a aplicação RubeApp já opera conectada a esta instância.
