# ADR-003: Estratégia de Deploy (Coolify)

**Date:** 2026-01-06
**Status:** Accepted

## Context
Para garantir a disponibilidade contínua e a segurança da aplicação Rube, é necessária uma estratégia de deploy automatizada, reprodutível e soberana (fora de plataformas PaaS proprietárias como Vercel/Netlify).

## Decision
Adotamos o **Coolify** como orquestrador de deploy e infraestrutura.

**Especificações:**
- **Build Pack:** Nixpacks (detecta automaticamente Node.js/Next.js e gera a imagem otimizada).
- **Source:** GitHub (`crashkill/Rube-Hitss`), branch `master`.
- **Variáveis de Ambiente:** Injetadas via Coolify UI/API (segurança de secrets).
- **Domínio:** `rube.fsw-hitss.duckdns.org` com SSL automático (Let's Encrypt).

## Consequences
**Positivas:**
- Deploy atômico via Git Push ou CLI.
- Rollbacks instantâneos disponíveis no painel do Coolify.
- Zero downtime deployments (configurável).
- Isenção de custos de licença de software de orquestração (Open Source).

**Negativas/Riscos:**
- Dependência da disponibilidade do servidor VPS único (Ponto único de falha se não houver cluster).
- Necessidade de monitorar logs de build no Coolify em caso de falha do Nixpacks.

## Notes
O deploy inicial foi realizado com sucesso via CLI (`coolify deploy`). O vazamento de credenciais detectado durante o setup foi mitigado e documentado como lição aprendida para rotação de chaves.
